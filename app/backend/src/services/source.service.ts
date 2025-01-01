import { Prisma, Source } from '@prisma/client';
import { QueryDataModel } from '../types/general';
import { db } from '../utils/db.server';
import { v4 } from 'uuid';

export const listSources = async (model: QueryDataModel): Promise<{ totalCount: number; sources: Source[] }> => {
  const { pagination, searchText, sort, filter } = model;

  const { pageSize, pageIndex } = pagination;
  // Infer query type from Prisma
  const query: Prisma.SourceFindManyArgs = {
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
      OR: [{ name: { contains: searchText, mode: 'insensitive' } }],
    };
  }

  // Sorting
  if (sort?.column) {
    query.orderBy = {
      [sort.column]: sort.type,
    };
  }

  const [totalCount, sources] = await Promise.all([db.source.count({ where: query.where }), db.source.findMany(query)]);

  return { totalCount, sources };
};

export const createSource = async (source: { name: string }): Promise<Source> => {
  return db.source.create({
    data: {
      id: v4(),
      ...source,
    },
  });
};
