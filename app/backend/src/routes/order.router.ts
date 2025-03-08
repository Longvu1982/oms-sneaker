import express from 'express';
import * as OrderController from '../controllers/order.controller';
import { protectAuth, protectRoles } from '../middleware/auth-middleware';
import { Role } from '@prisma/client';

const router = express.Router();

router.post('/list', protectAuth, protectRoles([Role.ADMIN, Role.USER]), OrderController.listOrders);

router.post(
  '/create',
  protectAuth,
  protectRoles([Role.ADMIN]),
  OrderController.validateOrderData,
  OrderController.createOrder
);
router.post('/create/bulk', protectAuth, protectRoles([Role.ADMIN]), OrderController.bulkCreateOrder);
router.post(
  '/create/check-missing-user-names',
  protectAuth,
  protectRoles([Role.ADMIN]),
  OrderController.checkMissingUsersName
);

router.post('/delete/bulk', protectAuth, protectRoles([Role.ADMIN]), OrderController.bulkDeleteOrder);
router.post('/delete', protectAuth, protectRoles([Role.ADMIN]), OrderController.deleteOrder);

router.put('/:id/update', protectAuth, protectRoles([Role.ADMIN]), OrderController.updateOrder);
router.put('/update-status/bulk', protectAuth, protectRoles([Role.ADMIN]), OrderController.updateMultipleOrders);

export default router;
