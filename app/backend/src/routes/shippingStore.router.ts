import express from 'express';
import * as ShippingController from '../controllers/shippingStore.controller';
import { protectAuth } from '../middleware/auth-middleware';

const router = express.Router();

router.post('/list', ShippingController.listShippingStores);

router.post('/create', protectAuth, ShippingController.createShippingStore);

router.post('/:id/update', protectAuth, ShippingController.updateStore);

export default router;
