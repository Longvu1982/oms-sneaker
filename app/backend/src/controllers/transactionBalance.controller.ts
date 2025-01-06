import { NextFunction, Request, Response } from 'express';
import * as TransactoionBalanceService from '../services/transactionBalance.service';
import HttpStatusCode from '../utils/HttpStatusCode';
import { sendSuccessResponse } from '../utils/responseHandler';

export const createTransactionBalance = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const transfer = request.body;
    const newTransfer = await TransactoionBalanceService.createTransactionBalance(transfer);
    return sendSuccessResponse(response, newTransfer, HttpStatusCode.CREATED);
  } catch (error: any) {
    next(error);
  }
};

export const getTransactionBalanceByDate = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const payload = request.body as { dateTime: string };
    const newTransfer = await TransactoionBalanceService.getTransactionBalanceByDate(payload);
    return sendSuccessResponse(response, newTransfer, HttpStatusCode.CREATED);
  } catch (error: any) {
    next(error);
  }
};
