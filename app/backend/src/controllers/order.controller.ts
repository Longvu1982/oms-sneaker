import { NextFunction, Request, Response } from 'express';
import * as AuthorService from '../services/author.service';
import * as OrderSevice from '../services/order.service';
import { TBookWrite, TOrderWrite } from '../types/general';
import { orderSchema } from '../types/zod';
import HttpStatusCode from '../utils/HttpStatusCode';
import { sendNotFoundResponse, sendSuccessNoDataResponse, sendSuccessResponse } from '../utils/responseHandler';
import { UUID } from 'node:crypto';
import { OrderStatus } from '@prisma/client';

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

export const updateOrderStatus = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.params.id as UUID;
    const existingOrder = await OrderSevice.getOrder(id);
    if (!existingOrder) return sendNotFoundResponse(response, 'Đơn không tồn tại hoặc đã bị xoá.');

    let currentStatus = existingOrder.status;
    const newStatus = request.body.status;

    if (currentStatus !== OrderStatus.ONGOING && newStatus === OrderStatus.ONGOING) {
      existingOrder.statusChangeDate = null;
    } else {
      existingOrder.statusChangeDate = new Date();
    }
    const updateOrder = await OrderSevice.updateOrderStaus(existingOrder.statusChangeDate, newStatus, id);
    return sendSuccessResponse(response, updateOrder);
  } catch (error: any) {
    next(error);
  }
};

export const deleteBook = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = parseInt(request.params.id, 10);
    await OrderSevice.deleteBook(id);
    return sendSuccessNoDataResponse(response, 'Book has been deleted');
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
