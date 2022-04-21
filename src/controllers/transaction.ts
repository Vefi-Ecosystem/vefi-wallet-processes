import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import * as db from '../db';

export default class TransactionController {
  static async findTransactionsByAccount(req: ExpressRequest, res: ExpressResponse) {
    try {
      let result = await db.models.tx.findByAccount(req.params.accountId);
      result = result.map((model) => model.toJSON());
      return res.status(200).json({ result });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
