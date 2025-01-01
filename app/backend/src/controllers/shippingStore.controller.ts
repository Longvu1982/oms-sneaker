import { NextFunction, Request, Response } from 'express';
import * as ShippingStoreService from '../services/shippingStore.service';
import { sendSuccessResponse } from '../utils/responseHandler';
import { TShippingStoreRequest } from '../types/general';
import HttpStatusCode from '../utils/HttpStatusCode';

export const listShippingStores = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = request.body;
    const orders = await ShippingStoreService.listShippingStores(query);
    return sendSuccessResponse(response, orders);
  } catch (error: any) {
    next(error);
  }
};

export const createShippingStore = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const store: TShippingStoreRequest = request.body;
    const newStore = await ShippingStoreService.createStore(store);
    return sendSuccessResponse(response, newStore, HttpStatusCode.CREATED);
  } catch (error: any) {
    next(error);
  }
};
