import express from 'express';
import * as TransactionController from '../controllers/transaction.controller';
import { protectAuth, protectRoles } from '../middleware/auth-middleware';
import { Role } from '@prisma/client';

const router = express.Router();

router.post('/list', protectAuth, TransactionController.listTransactions);
router.post('/create', protectAuth, protectRoles([Role.ADMIN]), TransactionController.createTransaction);
router.post('/delete/bulk', protectAuth, protectRoles([Role.ADMIN]), TransactionController.bulkDeleteTransaction);
router.post('/delete', protectAuth, protectRoles([Role.ADMIN]), TransactionController.deleteTransaction);
router.put('/:id/update', protectAuth, protectRoles([Role.ADMIN]), TransactionController.updateTransaction);

export default router;
