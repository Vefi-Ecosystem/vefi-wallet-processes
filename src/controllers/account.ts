import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import * as db from '../db';

export default class AccountController {
  static async createAccount(req: ExpressRequest, res: ExpressResponse) {
    try {
      let accountFound = await db.models.account.findByPk(req.body.id);

      if (!accountFound) {
        accountFound = await db.models.account.create({ id: req.body.id });
        const result = accountFound.toJSON();
        return res.status(201).json({ result });
      }

      const result = accountFound.toJSON();

      return res.status(200).json({ result });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
