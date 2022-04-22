import Web3 from 'web3';
import * as db from '../db';
import { BSC_WS_URL } from '../env';
import redis from '../helpers/redis';
import * as CONSTANTS from '../constants';
import logger from '../logger';
import erc20Abi from '../assets/ERC20ABI.json';
import { Op } from 'sequelize';

class BinanceProcess {
  web3: Web3;
  latency: number;
  processed_block_key: string;
  coin: string = 'BNB';

  constructor(latency: number = 10) {
    const provider = new Web3.providers.WebsocketProvider(<string>BSC_WS_URL, {
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
    this.processed_block_key = CONSTANTS.REDIS_PROCESSED_BLOCK_KEY.concat(':smartchain');
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
    const txReceipt = await this.web3.eth.getTransactionReceipt(transaction_id);

    if (txReceipt !== null && typeof txReceipt.status !== 'undefined' && !txReceipt.status) {
      logger('Tx receipt status failed');
      return;
    }

    try {
      const tx = await this.web3.eth.getTransaction(transaction_id.toString());
      let transactionDetail = {};

      if (!!txReceipt.status && txReceipt.logs.length > 0) {
        for (const log of txReceipt.logs) {
          setTimeout(() => {
            console.log('Now processing log: %s', log.address);
          }, this.latency * 1000);
          const callValue = await this.web3.eth.call({
            to: log.address,
            data: <string>this.web3.utils.sha3('decimals()')
          });
          const isERC20 = callValue !== '0x' && callValue !== '0x0';
          if (isERC20 && log.topics[1] !== undefined && log.topics[2] !== undefined) {
            console.log('Start processing contract: %s', log.address);
            const contract = new this.web3.eth.Contract(<any>erc20Abi, log.address);
            const decimals = await contract.methods.decimals().call();
            const symbol = await contract.methods.symbol().call();
            transactionDetail = {
              ...transactionDetail,
              tx_id: log.transactionHash,
              from: tx.from,
              to: tx.to,
              block_id: log.blockNumber,
              amount: <any>log.data / 10 ** decimals,
              coin: symbol,
              timestamp,
              status: 'CONFIRMED'
            };
            let walletTo: any = await db.models.wallet.findOne({ where: { address: { [Op.like]: <string>tx.to } } });

            if (!!walletTo) {
              walletTo = walletTo.toJSON();
              // Push transaction detail to Redis store
              const _val = await redis.setJsonVal(
                `${CONSTANTS.REDIS_TX_STORE_KEY}:${walletTo.accountId}`,
                log.transactionHash,
                transactionDetail
              );
              logger('Redis response: %d', _val);
            }

            let walletFrom: any = await db.models.wallet.findOne({
              where: { address: { [Op.like]: <string>tx.from } }
            });

            if (!!walletFrom) {
              walletFrom = walletFrom.toJSON();
              // Push transaction detail to Redis store
              const _val = await redis.setJsonVal(
                `${CONSTANTS.REDIS_TX_STORE_KEY}:${walletFrom.accountId}`,
                log.transactionHash,
                transactionDetail
              );
              logger('Redis response: %d', _val);
            }
          }
        }
      } else {
        if (tx) {
          transactionDetail = {
            ...transactionDetail,
            tx_id: tx.hash,
            from: tx.from,
            to: tx.to,
            block_id,
            amount: this.web3.utils.fromWei(tx.value),
            coin: this.coin,
            timestamp,
            status: 'CONFIRMED'
          };

          let walletTo: any = await db.models.wallet.findOne({ where: { address: { [Op.like]: <string>tx.to } } });

          if (!!walletTo) {
            walletTo = walletTo.toJSON();
            // Push transaction detail to Redis store
            const _val = await redis.setJsonVal(
              `${CONSTANTS.REDIS_TX_STORE_KEY}:${walletTo.accountId}`,
              tx.hash,
              transactionDetail
            );
            logger('Redis response: %d', _val);
          }

          let walletFrom: any = await db.models.wallet.findOne({ where: { address: { [Op.like]: <string>tx.from } } });

          if (!!walletFrom) {
            walletFrom = walletFrom.toJSON();
            // Push transaction detail to Redis store
            const _val = await redis.setJsonVal(
              `${CONSTANTS.REDIS_TX_STORE_KEY}:${walletFrom.accountId}`,
              tx.hash,
              transactionDetail
            );
            logger('Redis response: %d', _val);
          }
        }
      }
      logger('Transaction detail: %s', JSON.stringify(transactionDetail, undefined, 2));
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

const bnbProcess = new BinanceProcess(15);

export default bnbProcess;
