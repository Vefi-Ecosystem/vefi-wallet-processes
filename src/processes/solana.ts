import { Connection, clusterApiUrl, BlockResponse, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as db from '../db';
import { SOLANA_CLUSTER } from '../env';
import redis from '../helpers/redis';
import logger from '../logger';
import * as CONSTANTS from '../constants';
import { Op } from 'sequelize';

class SolanaProcess {
  web3: Connection;
  latency: number;
  processed_block_key: string;
  coin: string = 'SOL';

  constructor(latency: number = 10) {
    const clusterUrl = clusterApiUrl(<any>SOLANA_CLUSTER);
    this.web3 = new Connection(clusterUrl, 'finalized');
    this.latency = latency;
    this.processed_block_key = CONSTANTS.REDIS_PROCESSED_BLOCK_KEY.concat(':solana');
  }

  async lastProcessBlock(block: number) {
    const newBlock = block + 1;
    const _val = await redis.simpleSet(this.processed_block_key, newBlock);
    logger('Last block processed: %d, Redis response: %s', block, _val);
  }

  async getBlockTransaction(block_id: number) {
    try {
      const blockInfo = <BlockResponse>await this.web3.getBlock(block_id, { commitment: 'finalized' });
      if (blockInfo.transactions) {
        for (const el of blockInfo.transactions) {
          setTimeout(() => {
            logger('Now processing tx with signature: %s', el.transaction.signatures[0]);
          }, this.latency * 1000);
          this.getTransactionDetail(el.transaction.signatures[0], block_id, <number>blockInfo.blockTime);
        }
      }
    } catch (error: any) {
      logger(error.message);
    }
  }

  async getTransactionDetail(signature: string, block_id: number, timestamp: number) {
    try {
      const tx = await this.web3.getTransaction(signature, { commitment: 'finalized' });

      if (tx?.meta?.err || tx?.meta?.err !== null) {
        logger('Solana transaction failed with message: %s', JSON.stringify(tx?.meta?.err, undefined, 2));
        return;
      }

      if (tx && !tx.meta.err) {
        for (let i = 0; i < tx.transaction.message.header.numRequiredSignatures; i++) {
          const accountKey1 = tx.transaction.message.accountKeys[i];
          const preBalance = tx.meta.preBalances[i];
          const postBalance = tx.meta.postBalances[i];
          const amountSent = preBalance / LAMPORTS_PER_SOL - postBalance / LAMPORTS_PER_SOL;
          let walletFrom: any = await db.models.wallet.findOne({
            where: { address: { [Op.like]: accountKey1.toBase58() } }
          });
          const recipients = tx.transaction.message.accountKeys.slice(
            tx.transaction.message.header.numRequiredSignatures
          );
          let walletTo: any = await db.models.wallet.findOne({
            where: { address: { [Op.like]: recipients[i].toBase58() } }
          });

          let transactionDetail = {
            tx_id: signature,
            from: accountKey1.toBase58(),
            to: recipients[i].toBase58(),
            block_id: block_id,
            amount: amountSent,
            coin: this.coin,
            timestamp,
            status: 'CONFIRMED'
          };

          if (!!walletFrom) {
            walletFrom = walletFrom.toJSON();
            // Push transaction detail to Redis store
            const _val = await redis.setJsonVal(
              `${CONSTANTS.REDIS_TX_STORE_KEY}:${walletFrom.accountId}`,
              signature,
              transactionDetail
            );
            logger('Redis response: %d', _val);
          }

          if (!!walletTo) {
            walletTo = walletTo.toJSON();
            // Push transaction detail to Redis store
            const _val = await redis.setJsonVal(
              `${CONSTANTS.REDIS_TX_STORE_KEY}:${walletTo.accountId}`,
              signature,
              transactionDetail
            );
            logger('Redis response: %d', _val);
          }
        }
      }
    } catch (error: any) {
      logger(error.message);
    }
  }

  processBlocks() {
    try {
      const subId = this.web3.onSlotUpdate((update) => {
        if (!!update.slot && update.type === 'frozen') {
          setTimeout(() => {
            logger('Now processing slot: %d', update.slot);
          }, this.latency * 1000);
          this.getBlockTransaction(update.slot);
          this.lastProcessBlock(update.slot);
        }
      });
      logger('Solana subscription ID: %d', subId);
    } catch (error: any) {
      logger(error.message);
    }
  }

  async sync() {
    try {
      const exists = await redis.exists(this.processed_block_key);

      if (exists) {
        const lastBlock = await redis.simpleGet(this.processed_block_key);
        setTimeout(() => {
          logger('Now syncing from: %d', parseInt(<string>lastBlock));
        }, this.latency * 1000);
        const latestSlot = await this.web3.getSlot('finalized');

        for (let i = parseInt(<string>lastBlock); i <= latestSlot; i++) {
          setTimeout(() => {
            logger('Now syncing: %d', i);
          }, this.latency * 1000);
          this.getBlockTransaction(i);
          this.lastProcessBlock(i);
        }
      }
    } catch (error: any) {
      logger(error.message);
    }
  }
}

const solProcess = new SolanaProcess(5);

export default solProcess;
