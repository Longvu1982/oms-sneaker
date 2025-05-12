import { Prisma, Source } from '@prisma/client';
import { QueryDataModel } from '../types/general';
import { db } from '../utils/db.server';
import { v4 } from 'uuid';
import { RequestUser } from '../types/express';

export const listSources = async (
  model: QueryDataModel,
  requestUser: RequestUser
): Promise<{ totalCount: number; sources: Source[] }> => {
  const { pagination, searchText, sort, filter } = model;

  const { pageSize, pageIndex } = pagination;
  const query: Prisma.SourceFindManyArgs = {
    where: { adminId: requestUser.id },
    orderBy: {},
  };

  if (pageSize) {
    query.skip = pageIndex * pageSize;
    query.take = pageSize;
  }

  if (filter?.length) {
    query.where = {
      ...query.where,
      AND: filter.map(({ column, value }) => ({
        [column]: Array.isArray(value) ? { in: value } : value,
      })),
    };
  }

  if (searchText) {
    query.where = {
      ...query.where,
      OR: [{ name: { contains: searchText, mode: 'insensitive' } }],
    };
  }

  if (sort?.column) {
    query.orderBy = {
      [sort.column]: sort.type,
    };
  }

  const [totalCount, sources] = await Promise.all([db.source.count({ where: query.where }), db.source.findMany(query)]);

  return { totalCount, sources };
};

export const createSource = async (source: { name: string }, requestUser: RequestUser): Promise<Source> => {
  return db.source.create({
    data: {
      id: v4(),
      ...source,
      adminId: requestUser.id,
    },
  });
};

export const getSource = async (id: string): Promise<Source | null> => {
  return db.source.findUnique({
    where: {
      id,
    },
  });
};

export const updateSource = async (source: Source): Promise<Source> => {
  return db.source.update({
    where: {
      id: source.id,
    },
    data: { ...source },
  });
};
