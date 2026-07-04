import { OperationalCost } from '@prisma/client';
import { v4 } from 'uuid';
import { RequestUser } from '../types/express';
import { getVietnamMonthRange } from '../utils/date.utils';
import { db } from '../utils/db.server';

export const createOperationalCost = async (
  balanceData: {
    data: string;
    dateTime: string;
  },
  requestUser: RequestUser
): Promise<OperationalCost> => {
  const { startOfTheMonth, endOfTheMonth } = getVietnamMonthRange(balanceData.dateTime);

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
        data: balanceData.data,
        updatedAt: new Date(),
      },
    });
  } else {
    return db.operationalCost.create({
      data: {
        id: v4(),
        adminId: requestUser.id,
        dateTime: startOfTheMonth,
        data: balanceData.data,
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
  const { startOfTheMonth, endOfTheMonth } = getVietnamMonthRange(dateTime);

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
