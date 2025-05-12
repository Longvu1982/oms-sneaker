import { NextFunction, Request, Response } from 'express';
import * as UserService from '../services/user.service';
import { sendNotFoundResponse, sendSuccessNoDataResponse, sendSuccessResponse } from '../utils/responseHandler';
import { UUID } from 'node:crypto';

export const listUsers = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const user = request.user;
    const query = request.body;
    const orders = await UserService.listUsers(query, user!);
    return sendSuccessResponse(response, orders);
  } catch (error: any) {
    next(error);
  }
};

export const listUsersDetail = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = request.body;
    const user = request.user;
    const orders = await UserService.listUsersDetail(query, user);
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
    const user = request.user;
    const query = request.body;
    const created = await UserService.createUser(query, user!);
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
    const user = request.user;
    const { names } = request.body;
    const created = await UserService.bulkCreateUser(names as string[], user!);
    return sendSuccessResponse(response, created);
  } catch (error: any) {
    next(error);
  }
};

export const deleteUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.body.id;
    await UserService.deleteUser(id);
    return sendSuccessNoDataResponse(response, 'Xoá user thành công');
  } catch (error: any) {
    next(error);
  }
};

export const bulkDeleteUser = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { ids } = request.body;
    const deletedUsers = await UserService.bulkDeleteUser(ids);
    return sendSuccessResponse(response, deletedUsers);
  } catch (e) {
    next({ override: true, message: 'Xoá user không thành công' });
  }
};
