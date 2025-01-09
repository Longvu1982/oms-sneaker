import { NextFunction, Request, Response } from 'express';
import * as TransactionService from '../services/transaction.service';
import { TTransactionWrite } from '../types/general';
import { orderSchema } from '../types/zod';
import HttpStatusCode from '../utils/HttpStatusCode';
import { sendSuccessResponse } from '../utils/responseHandler';

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
