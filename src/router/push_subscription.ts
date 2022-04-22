import { Router } from 'express';
import PushSubscriptionController from '../controllers/push_subscription';

const router = Router();

router.post('/:accountId', PushSubscriptionController.createPushSubscription);
router.delete('/:accountId', PushSubscriptionController.deletePushSubscription);

export default router;
