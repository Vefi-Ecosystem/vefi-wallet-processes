import Web3 from 'web3';
import * as db from '../db';
import { AVAX_WS_URL } from '../env';
import redis from '../helpers/redis';
import * as CONSTANTS from '../constants';
import logger from '../logger';
import erc20Abi from '../assets/ERC20ABI.json';

class AvalancheProcess {
  web3: Web3;
  latency: number;
  processed_block_key: string;
  coin: string = 'AVAX';

  constructor(latency: number = 10) {
    const provider = new Web3.providers.WebsocketProvider(<string>AVAX_WS_URL, {
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
    this.processed_block_key = CONSTANTS.REDIS_PROCESSED_BLOCK_KEY.concat(':avalanche');
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
              let walletFrom: any = await db.models.wallet.findOne({ where: { address: tx.from } });

              if (!!walletFrom) {
                walletFrom = walletFrom.toJSON();
                await db.models.tx.create({
                  id: log.transactionHash,
                  from: tx.from,
                  to: tx.to,
                  timestamp,
                  coin: symbol,
                  status: 'FAILED',
                  amount: <any>log.data / 10 ** decimals,
                  accountId: walletFrom.accountId,
                  block_id
                });
              }
            }
          }
        } else {
          if (!!tx) {
            let walletFrom: any = await db.models.wallet.findOne({ where: { address: tx.from } });
            if (!!walletFrom) {
              walletFrom = walletFrom.toJSON();
              await db.models.tx.create({
                id: transaction_id,
                from: tx.from,
                to: tx.to,
                timestamp,
                coin: this.coin,
                status: 'FAILED',
                amount: this.web3.utils.fromWei(tx.value),
                accountId: walletFrom.accountId,
                block_id
              });
            }
          }
        }
        return;
      } else if (!!txReceipt.status) {
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
              let walletFrom: any = await db.models.wallet.findOne({ where: { address: tx.from } });

              if (!!walletFrom) {
                walletFrom = walletFrom.toJSON();
                await db.models.tx.create({
                  id: log.transactionHash,
                  from: tx.from,
                  to: tx.to,
                  timestamp,
                  coin: symbol,
                  status: 'CONFIRMED',
                  amount: <any>log.data / 10 ** decimals,
                  accountId: walletFrom.accountId,
                  block_id
                });
              }

              let walletTo: any = await db.models.wallet.findOne({ where: { address: tx.to } });

              if (!!walletTo) {
                walletTo = walletTo.toJSON();
                await db.models.tx.create({
                  id: log.transactionHash,
                  from: tx.from,
                  to: tx.to,
                  timestamp,
                  coin: symbol,
                  status: 'CONFIRMED',
                  amount: <any>log.data / 10 ** decimals,
                  accountId: walletTo.accountId,
                  block_id
                });
              }
            }
          }
        } else {
          if (!!tx) {
            let walletFrom: any = await db.models.wallet.findOne({ where: { address: tx.from } });
            if (!!walletFrom) {
              walletFrom = walletFrom.toJSON();
              await db.models.tx.create({
                id: transaction_id,
                from: tx.from,
                to: tx.to,
                timestamp,
                coin: this.coin,
                status: 'CONFIRMED',
                amount: this.web3.utils.fromWei(tx.value),
                accountId: walletFrom.accountId,
                block_id
              });
            }

            let walletTo: any = await db.models.wallet.findOne({ where: { address: tx.to } });
            if (!!walletTo) {
              walletTo = walletTo.toJSON();
              await db.models.tx.create({
                id: transaction_id,
                from: tx.from,
                to: tx.to,
                timestamp,
                coin: this.coin,
                status: 'CONFIRMED',
                amount: this.web3.utils.fromWei(tx.value),
                accountId: walletTo.accountId,
                block_id
              });
            }
          }
        }
      }
      logger('TX: %s', JSON.stringify(tx, undefined, 2));
    } catch (error: any) {
      logger(error.message);
    }
  }

  processBlocks() {
    this.web3.eth
      .subscribe('newBlockHeaders', (err, blockHeader) => {
        if (!err) logger('Now processing block header: %d', blockHeader.number);
        else return;
      })
      .on('connected', (subId) => logger('Subscription ID: %s', subId))
      .on('data', (blockHeader) => {
        if (blockHeader.number) {
          setTimeout(() => {
            logger('Now processing block header: %d', blockHeader.number);
          }, this.latency * 1000);
          this.getBlockTransaction(blockHeader.number);
          this.lastProcessBlock(blockHeader.number);
        }
      })
      .on('error', (error) => logger('Error occurred: %s', error.message));
  }

  async sync() {
    try {
      const exists = await redis.exists(this.processed_block_key);

      if (exists) {
        const lastBlock = await redis.simpleGet(this.processed_block_key);
        setTimeout(() => {
          logger('Now syncing from: %d', parseInt(<string>lastBlock));
        }, this.latency * 1000);
        const logs = await this.web3.eth.getPastLogs({ fromBlock: parseInt(<string>lastBlock) - 1 });

        for (const l of logs) {
          if (l.blockNumber) {
            setTimeout(() => {
              logger('Now syncing: %d', l.blockNumber);
            }, this.latency * 1000);
            this.getBlockTransaction(l.blockNumber);
            this.lastProcessBlock(l.blockNumber);
          }
        }
      }
    } catch (error: any) {
      logger(error.message);
    }
  }
}

const avaxProcess = new AvalancheProcess(30);

export default avaxProcess;
