import { NextFunction, Request, Response } from 'express';
import * as TransactionService from '../services/transaction.service';
import { TTransactionWrite } from '../types/general';
import { orderSchema } from '../types/zod';
import HttpStatusCode from '../utils/HttpStatusCode';
import { sendNotFoundResponse, sendSuccessNoDataResponse, sendSuccessResponse } from '../utils/responseHandler';
import { UUID } from 'node:crypto';

export const listTransactions = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = request.body;
    const transactions = await TransactionService.listTransactions(query);
    return sendSuccessResponse(response, transactions);
  } catch (error: any) {
    next(error);
  }
};

export const createTransaction = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const transaction: TTransactionWrite = request.body;
    const newTransaction = await TransactionService.createTransaction(transaction);
    return sendSuccessResponse(response, newTransaction, HttpStatusCode.CREATED);
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

export const updateTransaction = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.params.id as UUID;
    const existingTransaction = await TransactionService.getTransaction(id);
    if (!existingTransaction) return sendNotFoundResponse(response, 'Giao dịch không tồn tại hoặc đã bị xoá.');

    const updatedTransaction = await TransactionService.updateTransaction(request.body);
    return sendSuccessResponse(response, updatedTransaction);
  } catch (error: any) {
    next(error);
  }
};

export const bulkDeleteTransaction = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { ids } = request.body;
    const deletedTransactions = await TransactionService.bulkDeleteTransaction(ids);
    return sendSuccessResponse(response, deletedTransactions);
  } catch (e) {
    next({ override: true, message: 'Xoá giao dịch không thành công' });
  }
};

export const deleteTransaction = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.body.id;
    const deletedTransaction = await TransactionService.deleteTransaction(id);
    if (!deletedTransaction) return sendNotFoundResponse(response, 'Giao dịch không tồn tại hoặc đã bị xoá.');
    return sendSuccessNoDataResponse(response, 'Xoá giao dịch thành công');
  } catch (e) {
    next(e);
  }
};
