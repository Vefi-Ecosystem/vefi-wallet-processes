import { Router } from 'express';
import AccountRouter from './account';
import TransactionRouter from './transaction';
import PushSubscriptionRouter from './push_subscription';
import WalletRouter from './wallet';

const router = Router();

router.get('/health', (req, res) => res.status(200).json({ message: 'HEALTHY' }));

router.use('/account', AccountRouter);
router.use('/transaction', TransactionRouter);
router.use('/push', PushSubscriptionRouter);
router.use('/wallet', WalletRouter);
