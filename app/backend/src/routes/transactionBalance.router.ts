import express from 'express';
import * as TransactionBalanceController from '../controllers/transactionBalance.controller';
import { protectAuth, protectRoles } from '../middleware/auth-middleware';
import { Role } from '@prisma/client';

const router = express.Router();

router.post('/create', protectAuth, protectRoles([Role.ADMIN]), TransactionBalanceController.createTransactionBalance);
router.post('/get-by-date', protectAuth, TransactionBalanceController.getTransactionBalanceByDate);

export default router;
