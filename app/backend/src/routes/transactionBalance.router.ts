import express from 'express';
import * as TransactionBalanceController from '../controllers/transactionBalance.controller';
import { protectAuth } from '../middleware/auth-middleware';

const router = express.Router();

router.post('/create', protectAuth, TransactionBalanceController.createTransactionBalance);
router.post('/get-by-date', protectAuth, TransactionBalanceController.getTransactionBalanceByDate);

export default router;
