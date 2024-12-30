import { Prisma, User } from '@prisma/client';
import { QueryDataModel, TloginRead, TloginRequest } from '../types/general';
import { db } from '../utils/db.server';
import { TuserUpdateSchema } from './../types/zod';

export const listUsers = async (model: QueryDataModel): Promise<{ totalCount: number; users: User[] }> => {
  const { pagination, searchText, sort, filter } = model;

  const { pageSize, pageIndex } = pagination;
  // Infer query type from Prisma
  const query: Prisma.UserFindManyArgs = {
    omit: { password: true },
    where: {}, // Filtering conditions will be added dynamically
    orderBy: {}, // Sorting conditions will be added dynamically
  };

  if (pageSize) {
    query.skip = pageIndex * pageSize; // Paging: Calculate the offset
    query.take = pageSize; // Paging: Limit to the page size
  }

  // Filtering
  if (filter?.length) {
    query.where = {
      ...query.where,
      AND: filter.map(({ column, value }) => ({
        [column]: Array.isArray(value) ? { in: value } : value,
      })),
    };
  }

  // Searching
  if (searchText) {
    query.where = {
      ...query.where,
      OR: [
        { fullName: { contains: searchText, mode: 'insensitive' } },
        { username: { contains: searchText, mode: 'insensitive' } },
      ],
    };
  }

  // Sorting
  if (sort?.column) {
    query.orderBy = {
      [sort.column]: sort.type,
    };
  }

  const [totalCount, users] = await Promise.all([db.user.count({ where: query.where }), db.user.findMany(query)]);

  return { totalCount, users };
};

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
