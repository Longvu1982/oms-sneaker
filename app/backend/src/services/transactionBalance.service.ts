import { TransactionBalance } from '@prisma/client';
import { v4 } from 'uuid';import { RequestUser } from '../types/express';
import { getVietnamMonthRange } from '../utils/date.utils';
import { db } from '../utils/db.server';

export const createTransactionBalance = async (
  balanceData: {
    data: string;
    dateTime: string;
  },
  requestUser: RequestUser
): Promise<TransactionBalance> => {
  const { startOfTheMonth, endOfTheMonth } = getVietnamMonthRange(balanceData.dateTime);

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
        dateTime: startOfTheMonth,
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
  const { startOfTheMonth, endOfTheMonth } = getVietnamMonthRange(dateTime);

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
