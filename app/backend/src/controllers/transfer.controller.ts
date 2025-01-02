import { NextFunction, Request, Response } from 'express';
import * as TransferService from '../services/transfer.service';
import HttpStatusCode from '../utils/HttpStatusCode';
import { sendSuccessResponse } from '../utils/responseHandler';

export const createTransfer = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const transfer = request.body;
    const newTransfer = await TransferService.createTransfer(transfer);
    return sendSuccessResponse(response, newTransfer, HttpStatusCode.CREATED);
  } catch (error: any) {
    next(error);
  }
};
