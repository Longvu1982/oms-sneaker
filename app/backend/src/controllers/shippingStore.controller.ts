import { NextFunction, Request, Response } from 'express';
import * as ShippingStoreService from '../services/shippingStore.service';
import { sendNotFoundResponse, sendSuccessResponse } from '../utils/responseHandler';
import { TShippingStoreRequest } from '../types/general';
import HttpStatusCode from '../utils/HttpStatusCode';
import { UUID } from 'node:crypto';

export const listShippingStores = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = request.body;
    const orders = await ShippingStoreService.listShippingStores(query, request.user!);
    return sendSuccessResponse(response, orders);
  } catch (error: any) {
    next(error);
  }
};

export const createShippingStore = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const store: TShippingStoreRequest = request.body;
    const newStore = await ShippingStoreService.createStore(store, request.user!);
    return sendSuccessResponse(response, newStore, HttpStatusCode.CREATED);
  } catch (error: any) {
    next(error);
  }
};

export const updateStore = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.params.id as UUID;
    const existingStore = await ShippingStoreService.getStore(id);
    if (!existingStore) return sendNotFoundResponse(response, 'Kho không tồn tại hoặc đã bị xoá.');

    const updatedStore = await ShippingStoreService.updateStore(request.body);
    return sendSuccessResponse(response, updatedStore);
  } catch (error: any) {
    next(error);
  }
};
