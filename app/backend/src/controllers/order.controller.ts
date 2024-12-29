import HttpStatusCode from '../utils/HttpStatusCode';
import * as OrderSevice from '../services/order.service';
import * as AuthorService from '../services/author.service';
import { NextFunction, Request, Response } from 'express';
import { bookSchema } from '../types/zod';
import { TBookWrite } from '../types/general';
import { sendNotFoundResponse, sendSuccessNoDataResponse, sendSuccessResponse } from '../utils/responseHandler';

export const listOrders = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = request.body;
    const orders = await OrderSevice.listOrders(query);
    return sendSuccessResponse(response, orders);
  } catch (error: any) {
    next(error);
  }
};

export const getBook = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = parseInt(request.params.id, 10);
    const book = await OrderSevice.getBook(id);
    return sendSuccessResponse(response, book);
  } catch (error: any) {
    next(error);
  }
};

export const createBook = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const book: TBookWrite = request.body;
    book.datePublished = new Date(book.datePublished);
    const newBook = await OrderSevice.createBook(book);
    return sendSuccessResponse(response, newBook, HttpStatusCode.CREATED);
  } catch (error: any) {
    next(error);
  }
};

export const updateBook = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = parseInt(request.params.id, 10);
    const book: TBookWrite = request.body;
    book.datePublished = new Date(book.datePublished);
    const updateBook = await OrderSevice.updateBook(book, id);
    return sendSuccessResponse(response, updateBook);
  } catch (error: any) {
    next(error);
  }
};

export const deleteBook = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = parseInt(request.params.id, 10);
    await OrderSevice.deleteBook(id);
    return sendSuccessNoDataResponse(response, 'Book has been deleted');
  } catch (error: any) {
    next(error);
  }
};

export const checkExistingBook = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = parseInt(request.params.id, 10);
    const existingBook = await OrderSevice.getBook(id);
    if (!existingBook) {
      return sendNotFoundResponse(response, 'Book Not Found');
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const checkExistingBookAuthor = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const authorId: number = request.body.authorId;

    const existingAuthor = await AuthorService.getAuthor(authorId);

    if (!existingAuthor) {
      return sendNotFoundResponse(response, 'Author Not Found');
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const validateBookData = (request: Request, response: Response, next: NextFunction) => {
  try {
    const book = request.body;
    book.datePublished = new Date(book.datePublished);
    bookSchema.parse(book);
    next();
  } catch (error) {
    next(error);
  }
};
