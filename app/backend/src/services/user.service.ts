import { TuserUpdateSchema } from './../types/zod';
import { db } from '../utils/db.server';
import { TloginRead, TloginRequest } from '../types/general';

export const getUserByUsername = async (username: string): Promise<TloginRead | null> => {
  return db.user.findUnique({
    omit: {
      createdAt: true,
      updatedAt: true,
    },
    where: {
      username: username,
    },
  });
};

export const getUserByID = async (id: string): Promise<TloginRequest | null> => {
  return db.user.findUnique({
    where: {
      id: id,
    },
  });
};

export const updateUserByID = async (
  id: string,
  data: TuserUpdateSchema
): Promise<Omit<TloginRequest, 'id'> | null> => {
  return db.user.update({
    where: {
      id: id,
    },
    data: data,
  });
};
