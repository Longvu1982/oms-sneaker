import * as UserService from '../services/user.service';
import { NextFunction, Request, Response } from 'express';
import { TUserSchema, userSchema } from '../types/zod';
import { sendSuccessNoDataResponse, sendSuccessResponse, sendUnauthorizedResponse } from '../utils/responseHandler';
import { comparePasswords } from '../utils/bcryptHandler';
import { generateToken } from '../utils/jwtHandler';

export const login = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userRequest: TUserSchema = request.body;
    const account = await UserService.getAccountByUsername(userRequest.username);

    if (!account) {
      return sendUnauthorizedResponse(response, 'Sai username hoặc mật khẩu.');
    }

    const profile = await UserService.getUserByID(account.userId);

    if (!profile) return sendUnauthorizedResponse(response, 'Người dùng không tồn tại.');

    const passwordCompare = await comparePasswords(userRequest.password, account.password);

    if (passwordCompare) {
      const token = generateToken({ id: account.id }, '30d');

      response.cookie('jwt', token, {
        httpOnly: true,
        // secure: process.env.APP_ENV !== 'developement',
        secure: false,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      const responseData = {
        ...profile,
        account: { username: account.username, role: account.role },
      };
      return sendSuccessResponse(response, responseData);
    } else {
      return sendUnauthorizedResponse(response, 'Sai username hoặc mật khẩu.');
    }
  } catch (error: any) {
    next(error);
  }
};

export const authMe = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const user = request.user;
    if (user) return sendSuccessResponse(response, user);
    else {
      return sendUnauthorizedResponse(response, 'Vui lòng đăng nhập lại.');
    }
  } catch (error: any) {
    next(error);
  }
};

export const logout = async (request: Request, response: Response, next: NextFunction) => {
  try {
    response.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    return sendSuccessNoDataResponse(response, 'Logout Successful');
  } catch (error) {
    next(error);
  }
};

// Middlewares ________________________

export const validateLoginData = (request: Request, response: Response, next: NextFunction) => {
  try {
    const data = request.body;
    userSchema.parse(data);
    next();
  } catch (error) {
    next(error);
  }
};
