import { NextFunction, Request, Response } from 'express';
import * as SourceService from '../services/source.service';
import { sendSuccessResponse } from '../utils/responseHandler';

export const listSources = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = request.body;
    const orders = await SourceService.listSources(query);
    return sendSuccessResponse(response, orders);
  } catch (error: any) {
    next(error);
  }
};
