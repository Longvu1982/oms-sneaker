import { Prisma, Transaction } from '@prisma/client';
import { UUID } from 'node:crypto';
import { v4 } from 'uuid';
import { QueryDataModel, TTransactionWrite } from '../types/general';
import { db } from '../utils/db.server';
import { RequestUser } from '../types/express';
export const listTransactions = async (
  model: QueryDataModel,
  requestUser: RequestUser
): Promise<{ totalCount: number; transactions: Transaction[] }> => {
  const { pagination, searchText, sort, filter } = model;

  const { id } = requestUser ?? {};

  const { pageSize, pageIndex } = pagination;
  const query: Prisma.TransactionFindManyArgs = {
    include: { user: true },
    where: {
      adminId: id,
    },
    orderBy: [{ transactionDate: 'desc' }, { amount: 'desc' }],
  };

  if (pageSize) {
    query.skip = pageIndex * pageSize;
    query.take = pageSize;
  }

  if (filter?.length) {
    const filterArray: any = [];
    filter.forEach(({ column, value }) => {
      if (['transactionDate'].includes(column)) {
        const dateFilter: Record<string, Date> = {};
        if (value?.from && value?.to) {
          const fromDate = new Date(value.from);
          const toDate = new Date(value.to);

          if (fromDate.toDateString() === toDate.toDateString()) {
            dateFilter.gte = new Date(fromDate.setHours(0, 0, 0, 0));
            dateFilter.lte = new Date(toDate.setHours(23, 59, 59, 999));
          } else {
            dateFilter.gte = fromDate;
            dateFilter.lte = toDate;
          }
        } else {
          if (value?.from) {
            dateFilter.gte = new Date(value.from);
          }
          if (value?.to) {
            dateFilter.lte = new Date(value.to);
          }
        }
        if (Object.keys(dateFilter).length > 0) {
          filterArray.push({ [column]: dateFilter });
        }
      } else if (Array.isArray(value) && value.length > 0) {
        filterArray.push({ [column]: { in: value } });
      } else if (!Array.isArray(value) && value != null) {
        filterArray.push({ [column]: value });
      }
    });

    query.where = {
      ...query.where,
      AND: filterArray.length ? filterArray : undefined,
    };
  }

  if (searchText) {
    query.where = {
      ...query.where,
      OR: [{ user: { fullName: { contains: searchText, mode: 'insensitive' } } }],
    };
  }

  if (sort?.column) {
    query.orderBy = {
      [sort.column]: sort.type,
    };
  }

  const [totalCount, transactions] = await Promise.all([
    db.transaction.count({ where: query.where }),
    db.transaction.findMany(query),
  ]);

  return { totalCount, transactions };
};

export const getTransaction = async (id: UUID): Promise<Transaction | null> => {
  return db.transaction.findUnique({
    where: {
      id,
    },
  });
};

export const createTransaction = async (
  transaction: TTransactionWrite,
  requestUser: RequestUser
): Promise<Transaction> => {
  return db.transaction.create({
    data: {
      id: v4(),
      ...transaction,
      adminId: requestUser?.id,
    },
  });
};

export const updateTransaction = async (transaction: Transaction): Promise<Transaction> => {
  return db.transaction.update({
    where: {
      id: transaction.id,
    },
    data: { ...transaction },
  });
};

export const deleteTransaction = async (id: string): Promise<Transaction> => {
  return db.transaction.delete({
    where: {
      id,
    },
  });
};

export const bulkDeleteTransaction = async (ids: string[]): Promise<Prisma.BatchPayload> => {
  return db.transaction.deleteMany({
    where: {
      id: { in: ids },
    },
  });
};
