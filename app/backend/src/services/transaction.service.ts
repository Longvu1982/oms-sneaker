import { Order, Prisma, Transaction } from '@prisma/client';
import { UUID } from 'node:crypto';
import { v4 } from 'uuid';
import { QueryDataModel, TTransactionWrite } from '../types/general';
import { db } from '../utils/db.server';
export const listTransactions = async (
  model: QueryDataModel
): Promise<{ totalCount: number; transactions: Transaction[] }> => {
  const { pagination, searchText, sort, filter } = model;

  const { pageSize, pageIndex } = pagination;
  // Infer query type from Prisma
  const query: Prisma.TransactionFindManyArgs = {
    include: { user: true },
    where: {}, // Filtering conditions will be added dynamically
    orderBy: {}, // Sorting conditions will be added dynamically
  };

  if (pageSize) {
    query.skip = pageIndex * pageSize; // Paging: Calculate the offset
    query.take = pageSize; // Paging: Limit to the page size
  }

  // Filtering
  if (filter?.length) {
    const filterArray: any = [];
    filter.forEach(({ column, value }) => {
      if (['createdAt'].includes(column)) {
        const dateFilter: Record<string, Date> = {};
        if (value?.from) {
          dateFilter.gte = new Date(value.from);
        }
        if (value?.to) {
          dateFilter.lte = new Date(value.to);
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

  // Searching
  if (searchText) {
    query.where = {
      ...query.where,
      OR: [{ user: { fullName: { contains: searchText, mode: 'insensitive' } } }],
    };
  }

  // Sorting
  if (sort?.column) {
    query.orderBy = {
      [sort.column]: sort.type,
    };
  }

  const [totalCount, transactions] = await Promise.all([
    db.transaction.count({ where: query.where }), // Count the total number of matching orders
    db.transaction.findMany(query), // Fetch the orders with pagination, sorting, and filtering
  ]);

  // Return the totalCount and orders
  return { totalCount, transactions };
};

export const getTransaction = async (id: UUID): Promise<Order | null> => {
  return db.order.findUnique({
    where: {
      id,
    },
  });
};

export const createTransaction = async (transaction: TTransactionWrite): Promise<Transaction> => {
  return db.transaction.create({
    data: {
      id: v4(),
      ...transaction,
    },
  });
};
