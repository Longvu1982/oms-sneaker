import { TransactionBalance } from '@prisma/client';
import { v4 } from 'uuid';
import { db } from '../utils/db.server';
import { endOfMonth, parseISO, startOfMonth } from 'date-fns';

export const createTransactionBalance = async (balanceData: {
  data: string;
  dateTime: string;
}): Promise<TransactionBalance> => {
  // Parse the ISO 8601 string into a Date object
  const parsedDate = parseISO(balanceData.dateTime);

  // Get the start and end of the month using date-fns
  const startOfTheMonth = startOfMonth(parsedDate);
  const endOfTheMonth = endOfMonth(parsedDate);

  // Search for an existing record within the same month and year
  const existingTransaction = await db.transactionBalance.findFirst({
    where: {
      dateTime: {
        gte: startOfTheMonth,
        lte: endOfTheMonth,
      },
    },
  });

  if (existingTransaction) {
    // Update the existing record
    return db.transactionBalance.update({
      where: {
        id: existingTransaction.id,
      },
      data: {
        data: balanceData.data,
        updatedAt: new Date(), // Refresh updatedAt timestamp
      },
    });
  } else {
    // Create a new record
    return db.transactionBalance.create({
      data: {
        id: v4(),
        dateTime: parsedDate, // Use the parsed date
        data: balanceData.data,
      },
    });
  }
};

export const getTransactionBalanceByDate = async ({
  dateTime,
}: {
  dateTime: string;
}): Promise<TransactionBalance | null> => {
  const parsedDate = parseISO(dateTime);

  // Get the start and end of the month
  const startOfTheMonth = startOfMonth(parsedDate);
  const endOfTheMonth = endOfMonth(parsedDate);

  // Query the database for a matching record
  const transactionBalance =
    (await db.transactionBalance.findFirst({
      where: {
        dateTime: {
          gte: startOfTheMonth,
          lte: endOfTheMonth,
        },
      },
    })) ?? ({} as TransactionBalance);

  return transactionBalance;
};
