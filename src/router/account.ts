import { Router } from 'express';
import AccountController from '../controllers/account';

const router = Router();

router.post('/', AccountController.createAccount);

export default router;
