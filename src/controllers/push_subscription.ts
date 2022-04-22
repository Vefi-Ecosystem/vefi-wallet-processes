import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import * as db from '../db';

export default class PushSubscriptionController {
  static async createPushSubscription(req: ExpressRequest, res: ExpressResponse) {
    try {
      let pushSubFound = await db.models.push.findOne({
        where: { accountId: req.params.accountId }
      });

      if (!pushSubFound) {
        pushSubFound = await db.models.push.create({
          accountId: req.params.accountId,
          token: req.body.token
        });
        const result = pushSubFound.toJSON();
        return res.status(201).json({ result });
      } else {
        await db.models.push.update({ token: req.body.token }, { where: { accountId: req.params.accountId } });
        pushSubFound = await db.models.push.findOne({
          where: { accountId: req.params.accountId }
        });
      }

      const result = pushSubFound?.toJSON();
      return res.status(200).json({ result });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async deletePushSubscription(req: ExpressRequest, res: ExpressResponse) {
    try {
      const result = await db.models.push.remove({ where: { accountId: req.params.accountId } });
      return res.status(200).json({ result });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
