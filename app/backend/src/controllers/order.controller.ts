import { OrderStatus } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { UUID } from 'node:crypto';
import * as AuthorService from '../services/author.service';
import * as OrderSevice from '../services/order.service';
import { TBookWrite, TOrderWrite } from '../types/general';
import { orderSchema } from '../types/zod';
import HttpStatusCode from '../utils/HttpStatusCode';
import { sendNotFoundResponse, sendSuccessNoDataResponse, sendSuccessResponse } from '../utils/responseHandler';

export const listOrders = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = request.body;
    const orders = await OrderSevice.listOrders(query);
    return sendSuccessResponse(response, orders);
  } catch (error: any) {
    next(error);
  }
};

export const getBook = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = parseInt(request.params.id, 10);
    const book = await OrderSevice.getBook(id);
    return sendSuccessResponse(response, book);
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

export const updateBook = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = parseInt(request.params.id, 10);
    const book: TBookWrite = request.body;
    book.datePublished = new Date(book.datePublished);
    const updateBook = await OrderSevice.updateBook(book, id);
    return sendSuccessResponse(response, updateBook);
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

    if (currentStatus !== OrderStatus.ONGOING && newStatus === OrderStatus.ONGOING) {
      request.body.statusChangeDate = null;
    } else {
      request.body.statusChangeDate = new Date();
    }

    const updatedOrder = await OrderSevice.updateOrder(request.body);
    return sendSuccessResponse(response, updatedOrder);
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

export const checkExistingBook = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = parseInt(request.params.id, 10);
    const existingBook = await OrderSevice.getBook(id);
    if (!existingBook) {
      return sendNotFoundResponse(response, 'Book Not Found');
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const checkExistingBookAuthor = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const authorId: number = request.body.authorId;

    const existingAuthor = await AuthorService.getAuthor(authorId);

    if (!existingAuthor) {
      return sendNotFoundResponse(response, 'Author Not Found');
    }
    next();
  } catch (error) {
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
  } catch (error) {
    next(error);
  }
};
