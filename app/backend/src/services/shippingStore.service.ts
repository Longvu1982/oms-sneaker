import { Prisma, ShippingStore } from '@prisma/client';
import { QueryDataModel } from '../types/general';
import { db } from '../utils/db.server';

export const listShippingStores = async (
  model: QueryDataModel
): Promise<{ totalCount: number; shippingStores: ShippingStore[] }> => {
  const { pagination, searchText, sort, filter } = model;

  const { pageSize, pageIndex } = pagination;
  // Infer query type from Prisma
  const query: Prisma.ShippingStoreFindManyArgs = {
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

  const [totalCount, shippingStores] = await Promise.all([
    db.shippingStore.count({ where: query.where }),
    db.shippingStore.findMany(query),
  ]);

  return { totalCount, shippingStores };
};
