import express from 'express';
import * as ShippingController from '../controllers/shippingStore.controller';
import { protectAuth, protectRoles } from '../middleware/auth-middleware';
import { Role } from '@prisma/client';

const router = express.Router();

router.post('/list', protectAuth, protectRoles([Role.ADMIN]), ShippingController.listShippingStores);

router.post('/create', protectAuth, protectRoles([Role.ADMIN]), ShippingController.createShippingStore);

router.post('/:id/update', protectAuth, protectRoles([Role.ADMIN]), ShippingController.updateStore);

export default router;
