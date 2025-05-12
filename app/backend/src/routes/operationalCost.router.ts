import express from 'express';
import * as OperationalCostController from '../controllers/operationalCost.controller';
import { protectAuth, protectRoles } from '../middleware/auth-middleware';
import { Role } from '@prisma/client';

const router = express.Router();

router.post('/create', protectAuth, protectRoles([Role.ADMIN]), OperationalCostController.createOperationalCost);
router.post(
  '/get-by-date',
  protectAuth,
  protectRoles([Role.ADMIN]),
  OperationalCostController.getOperationalCostByDate
);

export default router;
