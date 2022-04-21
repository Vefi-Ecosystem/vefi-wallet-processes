import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import * as db from '../db';

export default class WalletController {
  static async createWallet(req: ExpressRequest, res: ExpressResponse) {
    try {
      let walletFound = await db.models.wallet.findOne({
        where: {
          accountId: req.body.accountId,
          address: req.body.address
        }
      });

      if (!walletFound) {
        walletFound = await db.models.wallet.create({
          accountId: req.body.accountId,
          address: req.body.address
        });
        const result = walletFound.toJSON();
        return res.status(201).json({ result });
      }

      const result = walletFound.toJSON();
      return res.status(200).json({ result });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
