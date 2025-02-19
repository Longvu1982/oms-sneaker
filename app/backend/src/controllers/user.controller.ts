import { NextFunction, Request, Response } from 'express';
import * as UserService from '../services/user.service';
import { sendNotFoundResponse, sendSuccessResponse } from '../utils/responseHandler';
import { UUID } from 'node:crypto';

export const listUsers = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = request.body;
    const orders = await UserService.listUsers(query);
    return sendSuccessResponse(response, orders);
  } catch (error: any) {
    next(error);
  }
};

export const listUsersDetail = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = request.body;
    const orders = await UserService.listUsersDetail(query);
    return sendSuccessResponse(response, orders);
  } catch (error: any) {
    next(error);
  }
};

export const getUserByID = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = request.params.userId;
    const userDetails = await UserService.getUserByID(userId);
    return sendSuccessResponse(response, userDetails);
  } catch (error: any) {
    next(error);
  }
};

export const createUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = request.body;
    const created = await UserService.createUser(query);
    return sendSuccessResponse(response, created);
  } catch (error: any) {
    next(error);
  }
};

export const updateUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.params.id as UUID;
    const existingUser = await UserService.getUserByID(id);
    if (!existingUser) return sendNotFoundResponse(response, 'User không tồn tại hoặc đã bị xoá.');

    const query = request.body;
    const updated = await UserService.updateUser(query);
    return sendSuccessResponse(response, updated);
  } catch (error: any) {
    next(error);
  }
};

export const bulkCreateUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { names } = request.body;
    const created = await UserService.bulkCreateUser(names as string[]);
    return sendSuccessResponse(response, created);
  } catch (error: any) {
    next(error);
  }
};
