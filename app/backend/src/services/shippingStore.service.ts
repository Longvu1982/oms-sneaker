import { Prisma, ShippingStore } from '@prisma/client';
import { QueryDataModel, TShippingStoreRequest } from '../types/general';
import { db } from '../utils/db.server';
import { v4 } from 'uuid';
import { RequestUser } from '../types/express';

export const listShippingStores = async (
  model: QueryDataModel,
  requestUser: RequestUser
): Promise<{ totalCount: number; shippingStores: ShippingStore[] }> => {
  const { pagination, searchText, sort, filter } = model;

  const { pageSize, pageIndex } = pagination;
  const query: Prisma.ShippingStoreFindManyArgs = {
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

  const [totalCount, shippingStores] = await Promise.all([
    db.shippingStore.count({ where: query.where }),
    db.shippingStore.findMany(query),
  ]);

  return { totalCount, shippingStores };
};

export const createStore = async (store: TShippingStoreRequest, requestUser: RequestUser): Promise<ShippingStore> => {
  return db.shippingStore.create({
    data: {
      ...store,
      id: v4(),
      adminId: requestUser.id,
    },
  });
};

export const getStore = async (id: string): Promise<ShippingStore | null> => {
  return db.shippingStore.findUnique({
    where: {
      id,
    },
  });
};

export const updateStore = async (store: ShippingStore): Promise<ShippingStore> => {
  return db.shippingStore.update({
    where: {
      id: store.id,
    },
    data: { ...store },
  });
};
