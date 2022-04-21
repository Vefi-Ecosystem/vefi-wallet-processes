import Web3 from 'web3';
import * as db from '../db';
import { ETH_WS_URL } from '../env';
import redis from '../helpers/redis';
import * as CONSTANTS from '../constants';
import logger from '../logger';
import erc20Abi from '../assets/ERC20ABI.json';

class EthereumProcess {
  web3: Web3;
  latency: number;
  processed_block_key: string;
  constructor(latency: number = 10) {
    const provider = new Web3.providers.WebsocketProvider(<string>ETH_WS_URL, {
      clientConfig: {
        maxReceivedFrameSize: 100000000,
        maxReceivedMessageSize: 100000000,
        keepalive: true,
        keepaliveInterval: 1600000
      },
      reconnect: {
        auto: true,
        delay: 5000,
        maxAttempts: 5,
        onTimeout: false
      }
    });
    this.web3 = new Web3(provider);
    this.latency = latency;
    this.processed_block_key = CONSTANTS.REDIS_PROCESSED_BLOCK_KEY.concat(':ethereum');
  }

  async lastProcessBlock(block: number) {
    const newBlock = block + 1;
    const _val = await redis.simpleSet(this.processed_block_key, newBlock);
    logger('Last block processed: %d, Redis response: %s', block, _val);
  }

  async getBlockTransaction(block_id: number) {
    const blockInfo = await this.web3.eth.getBlock(block_id);
    try {
      if (blockInfo.transactions) {
        for (const el of blockInfo.transactions) {
          setTimeout(() => {
            logger('Now processing tx: %s', el);
          }, this.latency * 1000);
          this.getTransactionDetail(el, block_id, Number(blockInfo.timestamp) * 1000);
        }
      }
    } catch (error: any) {
      logger(error.message);
    }
  }

  async getTransactionDetail(transaction_id: string, block_id: number, timestamp: number) {
    try {
      const tx = await this.web3.eth.getTransaction(transaction_id);
      const txReceipt = await this.web3.eth.getTransactionReceipt(transaction_id);

      if (txReceipt !== null && typeof txReceipt.status !== 'undefined' && !txReceipt.status) {
        logger('Tx receipt status failed');
        if (txReceipt.logs.length > 0) {
          for (const log of txReceipt.logs) {
            setTimeout(() => {
              logger('Processing log: %s', log.address);
            }, this.latency * 1000);
            const callValue = await this.web3.eth.call({
              to: log.address,
              data: <string>this.web3.utils.sha3('decimals()')
            });
            const isERC20 = callValue !== '0x' && callValue !== '0x0';
            if (isERC20 && log.topics[1] !== undefined && log.topics[2] !== undefined) {
              logger('Start processing contract: %s', log.address);
              const contract = new this.web3.eth.Contract(<any>erc20Abi, log.address);
              const decimals = await contract.methods.decimals().call();
              const symbol = await contract.methods.symbol().call();
              let walletFrom: any = await db.models.wallet.findOne({ where: { address: txReceipt.from } });

              if (!!walletFrom) {
                walletFrom = walletFrom.toJSON();
                await db.models.tx.create({
                  id: transaction_id,
                  from: txReceipt.from,
                  to: txReceipt.to,
                  timestamp,
                  coin: symbol,
                  status: 'FAILED',
                  amount: <any>log.data / 10 ** decimals,
                  accountId: walletFrom.accountId
                });
              }
            }
          }
        } else {
          let walletFrom: any = await db.models.wallet.findOne({ where: { address: txReceipt.from } });
          if (!!walletFrom) {
            walletFrom = walletFrom.toJSON();
            await db.models.tx.create({
              id: transaction_id,
              from: tx.from,
              to: tx.to,
              timestamp,
              coin: 'ETH',
              status: 'FAILED',
              amount: this.web3.utils.fromWei(tx.value),
              accountId: walletFrom.accountId
            });
          }
        }
        return;
      } else if (!!txReceipt.status) {
      }
    } catch (error: any) {}
  }
}
