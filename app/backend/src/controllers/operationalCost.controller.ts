import { NextFunction, Request, Response } from 'express';
import * as OperationalCostService from '../services/operationalCost.service';
import HttpStatusCode from '../utils/HttpStatusCode';
import { sendSuccessResponse } from '../utils/responseHandler';

export const createOperationalCost = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const user = request.user;
    const cost = request.body;
    const newCost = await OperationalCostService.createOperationalCost(cost, user!);
    return sendSuccessResponse(response, newCost, HttpStatusCode.CREATED);
  } catch (error: any) {
    next(error);
  }
};

export const getOperationalCostByDate = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const payload = request.body as { dateTime: string };
    const newCost = await OperationalCostService.getOperationalCostByDate({
      ...payload,
      requestUser: request.user,
    });
    return sendSuccessResponse(response, newCost, HttpStatusCode.CREATED);
  } catch (error: any) {
    next(error);
  }
};
