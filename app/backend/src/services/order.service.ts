import { Order, OrderStatus, Prisma, Role, User } from '@prisma/client';
import { UUID } from 'node:crypto';
import { v4 } from 'uuid';
import { QueryDataModel, TBulkOrderWrite, TOrderWrite } from '../types/general';
import { db } from '../utils/db.server';
import { RequestUser } from '../types/express';

const buildOrderQuery = (model: QueryDataModel, requestUser?: RequestUser): Prisma.OrderFindManyArgs => {
  const { pagination, searchText, sort, filter } = model;
  const { id } = requestUser ?? {};
  const { role } = requestUser?.account ?? {};
  const { pageSize, pageIndex } = pagination;

  const query: Prisma.OrderFindManyArgs = {
    include: { user: true, shippingStore: true, source: true },
    where: {},
    orderBy: [{ orderDate: 'desc' }, { totalPrice: 'desc' }],
  };

  // Only get record associated with specific Admin
  if (role === Role.ADMIN) {
    query.where = {
      ...query.where,
      user: {
        adminId: id,
      },
    };
  }

  if (pageSize) {
    query.skip = pageIndex * pageSize;
    query.take = pageSize;
  }

  const filterData = filter?.map((item) => {
    if (item.column === 'userId') {
      return { ...item, value: role === Role.USER ? [id] : item.value };
    }
    return item;
  });

  // Filtering
  if (filterData?.length) {
    const filterArray: any = [];
    filterData.forEach(({ column, value }) => {
      if (['orderDate', 'statusChangeDate'].includes(column)) {
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

  return query;
};

export const listOrders = async (
  model: QueryDataModel,
  requestUser?: RequestUser
): Promise<{ totalCount: number; orders: Order[]; groupedOrders: any[] }> => {
  const query = buildOrderQuery(model, requestUser);

  const [totalCount, orders] = await Promise.all([db.order.count({ where: query.where }), db.order.findMany(query)]);
  return { totalCount, orders, groupedOrders: groupOrdersByUser(orders as any) };
};

export const groupOrdersByUser = (orders: (Order & { user: User })[]) => {
  const groupedOrders = orders.reduce((acc, order) => {
    const { userId } = order;
    if (!acc[userId]) acc[userId] = [order];
    else acc[userId].push(order);
    return acc;
  }, {} as Record<string, (Order & { user: User })[]>);

  return Object.entries(groupedOrders)
    .map(([userId, data]) => ({
      userId,
      fullName: data[0].user.fullName,
      totalAmount: data.reduce((acc, item) => {
        return acc + (item.totalPrice ?? 0) - (item.deposit ?? 0) + (item.shippingFee ?? 0);
      }, 0),
      data,
    }))
    .sort((a, b) => b.data.length - a.data.length);
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

export const bulkCreateOrder = async (
  orders: TBulkOrderWrite[],
  requestUser: RequestUser
): Promise<Prisma.BatchPayload> => {
  const users = await db.user.findMany({
    where: {
      adminId: requestUser.id,
    },
    select: { id: true, fullName: true },
  });
  const shippingStores = await db.shippingStore.findMany({ select: { id: true, name: true } });
  const sources = await db.source.findMany({ select: { id: true, name: true } });

  const mappedOrders: (TOrderWrite & { id: UUID })[] = orders.map((item) => {
    const { userName, shippingStoreName, sourceName, secondShippingFee, ...rest } = item;
    return {
      ...rest,
      id: v4() as UUID,
      statusChangeDate: item.status !== OrderStatus.ONGOING ? new Date() : null,
      secondShippingFee: secondShippingFee ?? 0,
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

export const bulkDeleteOrder = async (ids: string[]): Promise<Prisma.BatchPayload> => {
  return db.order.deleteMany({
    where: {
      id: { in: ids },
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

export const checkMissingUsersName = async (userNames: string[], requestUser: RequestUser): Promise<string[]> => {
  const exsitingUser = await db.user.findMany({
    where: {
      adminId: requestUser.id,
      fullName: { in: userNames, mode: 'insensitive' },
    },
    select: { fullName: true },
  });

  const existingUsersName = new Set(exsitingUser.map(({ fullName }) => fullName.toLowerCase()));
  return userNames.filter((name) => !existingUsersName.has(name.toLowerCase()));
};

export const getOrdersByIds = async (ids: UUID[]) => {
  return db.order.findMany({ where: { id: { in: ids } }, select: { id: true, status: true } });
};

export const updateOrders = async (ids: UUID[], data: Partial<Order>) => {
  return db.order.updateMany({ where: { id: { in: ids } }, data });
};
