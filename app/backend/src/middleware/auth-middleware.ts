import * as UserService from '../services/user.service';
import { NextFunction, Request, Response } from 'express';
import { sendBadRequestResponse } from '../utils/responseHandler';
import { verifyToken } from '../utils/jwtHandler';
import { TloginRequest } from '../types/general';

const protectAuth = async (request: Request, response: Response, next: NextFunction) => {
  const allCookies = request.cookies;
  const token = allCookies.jwt;

  if (!token) {
    return sendBadRequestResponse(response, 'Vui lòng đăng nhập');
  }

  try {
    const decoded = verifyToken(token);
    const account = await UserService.getAccountById(decoded.id);
    if (!account?.id) {
      next();
      return sendBadRequestResponse(response, 'Vui lòng đăng nhập');
    }
    const user: TloginRequest | null = await UserService.getUserByID(account?.userId);
    if (!user) {
      next();
      return sendBadRequestResponse(response, 'Vui lòng đăng nhập');
    }
    request.user = {
      ...user,
      account: {
        username: account.username,
        role: account.role,
      },
    };
    next();
  } catch (error: any) {
    next(error);
  }
};

export { protectAuth };
