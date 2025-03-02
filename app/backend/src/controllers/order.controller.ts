import { OrderStatus } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { UUID } from 'node:crypto';
import * as OrderSevice from '../services/order.service';
import { TOrderWrite } from '../types/general';
import { orderSchema } from '../types/zod';
import HttpStatusCode from '../utils/HttpStatusCode';
import {
  sendBadRequestResponse,
  sendNotFoundResponse,
  sendSuccessNoDataResponse,
  sendSuccessResponse,
} from '../utils/responseHandler';

export const listOrders = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = request.body;
    const orders = await OrderSevice.listOrders(query);
    return sendSuccessResponse(response, orders);
  } catch (error: any) {
    next(error);
  }
};

export const createOrder = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const order: TOrderWrite = request.body;
    const newOrder = await OrderSevice.createOrder(order);
    return sendSuccessResponse(response, newOrder, HttpStatusCode.CREATED);
  } catch (error: any) {
    next(error);
  }
};

export const updateOrder = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.params.id as UUID;
    const existingOrder = await OrderSevice.getOrder(id);
    if (!existingOrder) return sendNotFoundResponse(response, 'Đơn không tồn tại hoặc đã bị xoá.');

    let currentStatus = existingOrder.status;
    const newStatus = request.body.status;

    if (newStatus !== currentStatus) {
      if (newStatus === OrderStatus.ONGOING) {
        request.body.statusChangeDate = null;
      } else {
        request.body.statusChangeDate = new Date();
      }
    }

    const updatedOrder = await OrderSevice.updateOrder(request.body);
    return sendSuccessResponse(response, updatedOrder);
  } catch (error: any) {
    next(error);
  }
};

export const updateMultipleOrders = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { ids, status: newStatus } = request.body as { ids: UUID[]; status: OrderStatus };

    if (!ids.length) {
      return sendBadRequestResponse(response, 'Danh sách đơn hàng không hợp lệ.');
    }

    const orders = await OrderSevice.getOrdersByIds(ids);
    if (!orders.length) {
      return sendNotFoundResponse(response, 'Không tìm thấy đơn hàng nào phù hợp.');
    }

    // Step 2: Categorize orders based on the status change logic
    const updateWithResetDateIds = orders
      .filter((order) => order.status !== OrderStatus.ONGOING && newStatus === OrderStatus.ONGOING)
      .map((order) => order.id as UUID);

    const updateWithNewDateIds = orders
      .filter((order) => !(order.status !== OrderStatus.ONGOING && newStatus === OrderStatus.ONGOING))
      .map((order) => order.id as UUID);

    // Step 3: Perform batch updates
    const updates = [];

    if (updateWithResetDateIds.length) {
      updates.push(OrderSevice.updateOrders(updateWithResetDateIds, { status: newStatus, statusChangeDate: null }));
    }

    if (updateWithNewDateIds.length) {
      updates.push(OrderSevice.updateOrders(updateWithNewDateIds, { status: newStatus, statusChangeDate: new Date() }));
    }

    await Promise.all(updates);

    return sendSuccessResponse(response, { message: 'Cập nhật đơn hàng thành công.' });
  } catch (error: any) {
    next(error);
  }
};

export const deleteOrder = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.body.id;
    await OrderSevice.deleteOrder(id);
    return sendSuccessNoDataResponse(response, 'Xoá đơn hàng thành công');
  } catch (error: any) {
    next(error);
  }
};

export const validateOrderData = (request: Request, response: Response, next: NextFunction) => {
  try {
    const order = request.body;
    orderSchema.parse(order);
    next();
  } catch (error) {
    next(error);
  }
};

export const checkMissingUsersName = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { names } = request.body;
    const missingNames = await OrderSevice.checkMissingUsersName(names);
    return sendSuccessResponse(response, missingNames);
  } catch (error) {
    next(error);
  }
};

export const bulkCreateOrder = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { orders } = request.body;
    const createdOrders = await OrderSevice.bulkCreateOrder(orders);
    return sendSuccessResponse(response, createdOrders);
  } catch (e) {
    next({ override: true, message: 'Tạo đơn hàng không thành công, kiểm tra kiểu dữ liệu và chính tả' });
  }
};

export const bulkDeleteOrder = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { ids } = request.body;
    const deletedOrders = await OrderSevice.bulkDeleteOrder(ids);
    return sendSuccessResponse(response, deletedOrders);
  } catch (e) {
    next({ override: true, message: 'Xoá đơn hàng không thành công' });
  }
};
