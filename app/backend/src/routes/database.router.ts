import express from 'express';
import * as DatabaseController from '../controllers/database.controller';
import { protectAuth, protectRoles } from '../middleware/auth-middleware';
import { Role } from '@prisma/client';

const router = express.Router();

router.get('/export', protectAuth, protectRoles([Role.ADMIN]), DatabaseController.exportDatabase);
router.get('/last-backup-time', protectAuth, protectRoles([Role.ADMIN]), DatabaseController.getLastBackupTime);

export default router;
