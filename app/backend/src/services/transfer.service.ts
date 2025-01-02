import { Transfered } from '@prisma/client';
import { v4 } from 'uuid';
import { db } from '../utils/db.server';

export const createTransfer = async (transfer: {
  amount: number;
  userId: string;
  createdAt: string;
}): Promise<Transfered> => {
  return db.transfered.create({
    data: {
      id: v4(),
      ...transfer,
    },
  });
};
