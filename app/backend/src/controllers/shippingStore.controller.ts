import { NextFunction, Request, Response } from 'express';
import * as ShippingStoreService from '../services/shippingStore.service';
import { sendSuccessResponse } from '../utils/responseHandler';

export const listShippingStores = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = request.body;
    const orders = await ShippingStoreService.listShippingStores(query);
    return sendSuccessResponse(response, orders);
  } catch (error: any) {
    next(error);
  }
};
