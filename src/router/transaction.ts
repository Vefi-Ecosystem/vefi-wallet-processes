import { Router } from 'express';
import TransactionController from '../controllers/transaction';

const router = Router();

router.get('/:accountId', TransactionController.findTransactionsByAccount);

export default router;
