import express from 'express';
import * as OrderController from '../controllers/order.controller';
import { protectAuth } from '../middleware/auth-middleware';

const router = express.Router();

router.get('/:id', protectAuth, OrderController.checkExistingBook, OrderController.getBook);
router.post('/list', protectAuth, OrderController.listOrders);

router.post('/create', protectAuth, OrderController.validateOrderData, OrderController.createOrder);
router.post('/create/bulk', protectAuth, OrderController.bulkCreateOrder);
router.post('/create/check-missing-user-names', protectAuth, OrderController.checkMissingUsersName);

router.post('/delete/bulk', protectAuth, OrderController.bulkDeleteOrder);
router.post('/delete', protectAuth, OrderController.deleteOrder);

router.put('/:id/update', protectAuth, OrderController.updateOrder);
router.delete('/:id', protectAuth, OrderController.checkExistingBook, OrderController.deleteOrder);

export default router;
