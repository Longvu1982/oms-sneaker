import express from 'express';
import * as TransferController from '../controllers/transfer.controller';
import { protectAuth, protectRoles } from '../middleware/auth-middleware';
import { Role } from '@prisma/client';

const router = express.Router();

router.post('/create', protectAuth, protectRoles([Role.ADMIN]), TransferController.createTransfer);

export default router;
