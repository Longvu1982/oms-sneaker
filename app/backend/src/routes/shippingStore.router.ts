import express from 'express';
import * as ShippingController from '../controllers/shippingStore.controller';

const router = express.Router();

router.post('/list', ShippingController.listShippingStores);

export default router;
