import { db } from '../utils/db.server';
import { QueryDataModel, TBookID, TBookRead, TBookWrite, TBulkOrderWrite, TOrderWrite } from '../types/general';
import { Order, OrderStatus, Prisma } from '@prisma/client';
import { v4 } from 'uuid';
import { UUID } from 'node:crypto';
export const listOrders = async (model: QueryDataModel): Promise<{ totalCount: number; orders: Order[] }> => {
  const { pagination, searchText, sort, filter } = model;

  const { pageSize, pageIndex } = pagination;
  // Infer query type from Prisma
  const query: Prisma.OrderFindManyArgs = {
    include: { user: true, shippingStore: true, source: true },
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
      if (['orderDate', 'statusChangeDate'].includes(column)) {
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
      OR: [
        { orderNumber: { contains: searchText, mode: 'insensitive' } },
        { SKU: { contains: searchText, mode: 'insensitive' } },
        { deliveryCode: { contains: searchText, mode: 'insensitive' } },
        { user: { fullName: { contains: searchText, mode: 'insensitive' } } },
        { source: { name: { contains: searchText, mode: 'insensitive' } } },
        { shippingStore: { name: { contains: searchText, mode: 'insensitive' } } },
      ],
    };
  }

  // Sorting
  if (sort?.column) {
    query.orderBy = {
      [sort.column]: sort.type,
    };
  }

  const [totalCount, orders] = await Promise.all([
    db.order.count({ where: query.where }), // Count the total number of matching orders
    db.order.findMany(query), // Fetch the orders with pagination, sorting, and filtering
  ]);

  // Return the totalCount and orders
  return { totalCount, orders };
};

export const getBook = async (id: TBookID): Promise<TBookRead | null> => {
  return db.book.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      isFiction: true,
      datePublished: true,
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

export const getOrder = async (id: UUID): Promise<Order | null> => {
  return db.order.findUnique({
    where: {
      id,
    },
  });
};

export const createOrder = async (order: TOrderWrite): Promise<Order> => {
  return db.order.create({
    data: {
      id: v4(),
      ...order,
      statusChangeDate: order.status !== OrderStatus.ONGOING ? new Date() : null,
    },
  });
};

export const bulkCreateOrder = async (orders: TBulkOrderWrite[]): Promise<Prisma.BatchPayload> => {
  const users = await db.user.findMany({ select: { id: true, fullName: true } });
  const shippingStores = await db.shippingStore.findMany({ select: { id: true, name: true } });
  const sources = await db.source.findMany({ select: { id: true, name: true } });

  const mappedOrders: (TOrderWrite & { id: UUID })[] = orders.map((item) => {
    const { userName, shippingStoreName, sourceName, ...rest } = item;
    return {
      ...rest,
      id: v4() as UUID,
      statusChangeDate: item.status !== OrderStatus.ONGOING ? new Date() : null,
      secondShippingFee: 0,
      userId: users.find((u) => u.fullName.trim().toLowerCase() === item.userName.trim().toLowerCase())?.id ?? '',
      sourceId: sources.find((u) => u.name.trim().toLowerCase() === item.sourceName.trim().toLowerCase())?.id ?? '',
      shippingStoreId:
        shippingStores.find((u) => u.name.trim().toLowerCase() === item.shippingStoreName.trim().toLowerCase())?.id ??
        '',
    };
  });

  return db.order.createMany({
    data: mappedOrders,
  });
};

export const updateBook = async (book: TBookWrite, id: TBookID): Promise<TBookRead> => {
  const { title, isFiction, datePublished, authorId } = book;
  return db.book.update({
    where: {
      id,
    },
    data: {
      title,
      isFiction,
      datePublished,
      authorId,
    },
    select: {
      id: true,
      title: true,
      isFiction: true,
      datePublished: true,
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

export const updateOrder = async (order: Order): Promise<Order> => {
  return db.order.update({
    where: {
      id: order.id,
    },
    data: { ...order },
  });
};

export const deleteOrder = async (id: string): Promise<void> => {
  await db.order.delete({
    where: {
      id,
    },
  });
};

export const checkMissingUsersName = async (userNames: string[]): Promise<string[]> => {
  const exsitingUser = await db.user.findMany({
    where: {
      fullName: { in: userNames, mode: 'insensitive' },
    },
    select: { fullName: true },
  });

  const existingUsersName = new Set(exsitingUser.map(({ fullName }) => fullName.toLowerCase()));
  return userNames.filter((name) => !existingUsersName.has(name.toLowerCase()));
};
