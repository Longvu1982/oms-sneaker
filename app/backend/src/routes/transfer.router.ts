import express from 'express';
import * as TransferController from '../controllers/transfer.controller';
import { protectAuth } from '../middleware/auth-middleware';

const router = express.Router();

router.post('/create', protectAuth, TransferController.createTransfer);

export default router;
