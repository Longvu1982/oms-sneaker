import { TransactionBalance } from '@prisma/client';
import { v4 } from 'uuid';
import { db } from '../utils/db.server';
import { endOfMonth, parseISO, startOfMonth } from 'date-fns';
import { RequestUser } from '../types/express';

export const createTransactionBalance = async (
  balanceData: {
    data: string;
    dateTime: string;
  },
  requestUser: RequestUser
): Promise<TransactionBalance> => {
  const parsedDate = parseISO(balanceData.dateTime);

  const startOfTheMonth = startOfMonth(parsedDate);
  const endOfTheMonth = endOfMonth(parsedDate);

  const existingTransaction = await db.transactionBalance.findFirst({
    where: {
      dateTime: {
        gte: startOfTheMonth,
        lte: endOfTheMonth,
      },
      adminId: requestUser.id,
    },
  });

  if (existingTransaction) {
    return db.transactionBalance.update({
      where: {
        id: existingTransaction.id,
      },
      data: {
        data: balanceData.data,
        updatedAt: new Date(),
      },
    });
  } else {
    return db.transactionBalance.create({
      data: {
        id: v4(),
        adminId: requestUser.id,
        dateTime: parsedDate,
        data: balanceData.data,
      },
    });
  }
};

export const getTransactionBalanceByDate = async ({
  dateTime,
  requestUser,
}: {
  dateTime: string;
  requestUser?: RequestUser;
}): Promise<TransactionBalance | null> => {
  const parsedDate = parseISO(dateTime);

  const startOfTheMonth = startOfMonth(parsedDate);
  const endOfTheMonth = endOfMonth(parsedDate);

  const transactionBalance =
    (await db.transactionBalance.findFirst({
      where: {
        dateTime: {
          gte: startOfTheMonth,
          lte: endOfTheMonth,
        },
        adminId: requestUser?.id,
      },
    })) ?? ({} as TransactionBalance);

  return transactionBalance;
};
