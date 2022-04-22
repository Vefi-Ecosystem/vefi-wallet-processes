import { Router } from 'express';
import WalletController from '../controllers/wallet';

const router = Router();

router.post('/', WalletController.createWallet);

export default router;
