import { OperationalCost } from '@prisma/client';
import { endOfMonth, parseISO, startOfMonth } from 'date-fns';
import { v4 } from 'uuid';
import { RequestUser } from '../types/express';
import { db } from '../utils/db.server';

export const createOperationalCost = async (
  balanceData: {
    amount: number;
    dateTime: string;
  },
  requestUser: RequestUser
): Promise<OperationalCost> => {
  const parsedDate = parseISO(balanceData.dateTime);

  const startOfTheMonth = startOfMonth(parsedDate);
  const endOfTheMonth = endOfMonth(parsedDate);

  const existingCost = await db.operationalCost.findFirst({
    where: {
      dateTime: {
        gte: startOfTheMonth,
        lte: endOfTheMonth,
      },
      adminId: requestUser.id,
    },
  });

  if (existingCost) {
    return db.operationalCost.update({
      where: {
        id: existingCost.id,
      },
      data: {
        amount: balanceData.amount,
        updatedAt: new Date(),
      },
    });
  } else {
    return db.operationalCost.create({
      data: {
        id: v4(),
        adminId: requestUser.id,
        dateTime: parsedDate,
        amount: balanceData.amount,
      },
    });
  }
};

export const getOperationalCostByDate = async ({
  dateTime,
  requestUser,
}: {
  dateTime: string;
  requestUser?: RequestUser;
}): Promise<OperationalCost | null> => {
  const parsedDate = parseISO(dateTime);

  const startOfTheMonth = startOfMonth(parsedDate);
  const endOfTheMonth = endOfMonth(parsedDate);

  const cost =
    (await db.operationalCost.findFirst({
      where: {
        dateTime: {
          gte: startOfTheMonth,
          lte: endOfTheMonth,
        },
        adminId: requestUser?.id,
      },
    })) ?? ({} as OperationalCost);

  return cost;
};
