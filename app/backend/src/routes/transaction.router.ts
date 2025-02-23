import express from 'express';
import * as TransactionController from '../controllers/transaction.controller';
import { protectAuth } from '../middleware/auth-middleware';

const router = express.Router();

router.post('/list', protectAuth, TransactionController.listTransactions);
router.post('/create', protectAuth, TransactionController.createTransaction);
router.post('/delete/bulk', protectAuth, TransactionController.bulkDeleteTransaction);
router.post('/delete', protectAuth, TransactionController.deleteTransaction);
router.put('/:id/update', protectAuth, TransactionController.updateTransaction);

export default router;
