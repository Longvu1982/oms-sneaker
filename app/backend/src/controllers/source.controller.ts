import { NextFunction, Request, Response } from 'express';
import * as SourceService from '../services/source.service';
import HttpStatusCode from '../utils/HttpStatusCode';
import { sendNotFoundResponse, sendSuccessResponse } from '../utils/responseHandler';
import { UUID } from 'node:crypto';

export const listSources = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = request.body;
    const orders = await SourceService.listSources(query, request.user!);
    return sendSuccessResponse(response, orders);
  } catch (error: any) {
    next(error);
  }
};

export const createSource = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const source: { name: string } = request.body;
    const newOrder = await SourceService.createSource(source, request.user!);
    return sendSuccessResponse(response, newOrder, HttpStatusCode.CREATED);
  } catch (error: any) {
    next(error);
  }
};

export const updateSource = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.params.id as UUID;
    const existingSource = await SourceService.getSource(id);
    if (!existingSource) return sendNotFoundResponse(response, 'Nguồn không tồn tại hoặc đã bị xoá.');

    const updatedSource = await SourceService.updateSource(request.body);
    return sendSuccessResponse(response, updatedSource);
  } catch (error: any) {
    next(error);
  }
};
