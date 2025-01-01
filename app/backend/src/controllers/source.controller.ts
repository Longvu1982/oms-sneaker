import { NextFunction, Request, Response } from 'express';
import * as SourceService from '../services/source.service';
import { sendSuccessResponse } from '../utils/responseHandler';
import HttpStatusCode from '../utils/HttpStatusCode';

export const listSources = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = request.body;
    const orders = await SourceService.listSources(query);
    return sendSuccessResponse(response, orders);
  } catch (error: any) {
    next(error);
  }
};

export const createSource = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const source: { name: string } = request.body;
    const newOrder = await SourceService.createSource(source);
    return sendSuccessResponse(response, newOrder, HttpStatusCode.CREATED);
  } catch (error: any) {
    next(error);
  }
};
