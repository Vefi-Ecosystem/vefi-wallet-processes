import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import redis from '../helpers/redis';
import * as CONSTANTS from '../constants';

export default class TransactionController {
  static async findTransactionsByAccount(req: ExpressRequest, res: ExpressResponse) {
    try {
      const exists = await redis.exists(`${CONSTANTS.REDIS_TX_STORE_KEY}:${req.params.accountId}`);

      if (!exists) return res.status(200).json({ result: [] });

      let result: any = await redis.getJsonVal(CONSTANTS.REDIS_TX_STORE_KEY.concat(`:${req.params.accountId}`));
      Object.keys(result).forEach((val) => {
        result[val] = JSON.parse(result[val]);
      });
      result = Object.keys(result)
        .map((key) => ({ ...result[key] }))
        .sort((a, b) => b.timestamp - a.timestamp);
      return res.status(200).json({ result });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
