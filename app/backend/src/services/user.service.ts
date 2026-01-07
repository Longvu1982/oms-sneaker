import { Account, Order, OrderStatus, Prisma, Role, Transfered, User } from '@prisma/client';
import { QueryDataModel, TloginRequest } from '../types/general';
import { db } from '../utils/db.server';
import { TuserUpdateSchema } from './../types/zod';
import { v4 } from 'uuid';
import { hashPassword } from '../utils/bcryptHandler';
import { RequestUser } from '../types/express';

export const listUsers = async (
  model: QueryDataModel,
  requestUser: RequestUser
): Promise<{ totalCount: number; users: User[] }> => {
  const { pagination, searchText, sort, filter } = model;
  const { id } = requestUser ?? {};
  const { role } = requestUser?.account ?? {};

  const { pageSize, pageIndex } = pagination;
  const query: Prisma.UserFindManyArgs = {
    where: {},
    orderBy: {},
    include: {
      account: {
        select: {
          id: true,
          username: true,
          role: true,
        },
      },
    },
  };

  if (role === Role.ADMIN) {
    query.where = {
      ...query.where,
      adminId: id,
    };
  }

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
      OR: [
        { fullName: { contains: searchText, mode: 'insensitive' } },
        { account: { username: { contains: searchText, mode: 'insensitive' } } },
      ],
    };
  }

  if (sort?.column) {
    query.orderBy = {
      [sort.column]: sort.type,
    };
  }

  const [totalCount, users] = await Promise.all([db.user.count({ where: query.where }), db.user.findMany(query)]);

  return { totalCount, users };
};

export const listUsersDetail_old = async (
  model: QueryDataModel,
  requestUser?: RequestUser
): Promise<{ totalCount: number; users: User[]; totalBalance: number }> => {
  const { pagination, searchText, sort, filter } = model;

  const { id } = requestUser ?? {};
  const { role } = requestUser?.account ?? {};

  const { pageSize, pageIndex } = pagination;
  // Infer query type from Prisma
  const baseQuery: Prisma.UserFindManyArgs = {
    where: {},
    orderBy: {},
    include: {
      orders: {
        where: {
          status: {
            not: {
              equals: 'CANCELLED',
            },
          },
        },
      },
      transfers: true,
      account: {
        select: {
          id: true,
          username: true,
          role: true,
        },
      },
    },
  };

  if (role === Role.ADMIN) {
    baseQuery.where = {
      ...baseQuery.where,
      adminId: id,
    };
  } else if (role === Role.SUPER_ADMIN) {
    baseQuery.where = {
      ...baseQuery.where,
      account: {
        role: {
          equals: Role.ADMIN,
        },
      },
    };
  }

  const filterData = filter?.map((item) => {
    if (item.column === 'id') {
      return { ...item, value: role === Role.USER ? [id] : item.value };
    }
    return item;
  });

  // Filtering
  if (filterData?.length) {
    baseQuery.where = {
      ...baseQuery.where,
      AND: filterData.map(({ column, value }) => ({
        [column]: Array.isArray(value) ? { in: value } : value,
      })),
    };
  }

  const allUsers = await db.user.findMany(baseQuery);
  const totalBalance = allUsers.reduce((sum, user) => sum + userWithBalance(user).balance, 0);

  if (pageSize) {
    baseQuery.skip = pageIndex * pageSize; // Paging: Calculate the offset
    baseQuery.take = pageSize; // Paging: Limit to the page size
  }

  // Searching
  if (searchText) {
    baseQuery.where = {
      ...baseQuery.where,
      OR: [
        { fullName: { contains: searchText, mode: 'insensitive' } },
        { account: { username: { contains: searchText, mode: 'insensitive' } } },
      ],
    };
  }

  // Sorting
  if (sort?.column) {
    baseQuery.orderBy = {
      [sort.column]: sort.type,
    };
  }

  const [totalCount, users] = await Promise.all([
    db.user.count({ where: baseQuery.where }),
    db.user.findMany(baseQuery),
  ]);

  const userResponse = users.map(userWithBalance).sort((a, b) => a.balance - b.balance);

  return { totalBalance, totalCount, users: userResponse };
};

export const listUsersDetail = async (
  model: QueryDataModel,
  requestUser?: RequestUser
): Promise<{ totalCount: number; users: any[]; totalBalance: number }> => {
  const { pagination, searchText, sort, filter } = model;
  const { pageSize, pageIndex } = pagination;
  const { id } = requestUser ?? {};
  const { role } = requestUser?.account ?? {};

  /* ----------------------------------
   * 1. Build base WHERE clause
   * ---------------------------------- */
  const where: Prisma.UserWhereInput = {};

  if (role === Role.ADMIN) {
    where.adminId = id;
  } else if (role === Role.SUPER_ADMIN) {
    where.account = { role: Role.ADMIN };
  }

  if (filter?.length) {
    where.AND = filter.map(({ column, value }) => ({
      [column]: Array.isArray(value) ? { in: value } : value,
    }));
  }

  if (searchText) {
    where.OR = [
      { fullName: { contains: searchText, mode: 'insensitive' } },
      { account: { username: { contains: searchText, mode: 'insensitive' } } },
    ];
  }

  /* ----------------------------------
   * 2. Fetch users (NO orders, NO transfers)
   * ---------------------------------- */
  const [totalCount, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      skip: pageSize ? pageIndex * pageSize : undefined,
      take: pageSize,
      orderBy: sort?.column ? { [sort.column]: sort.type } : undefined,
      select: {
        id: true,
        fullName: true,
        adminId: true,
        account: {
          select: { id: true, username: true, role: true },
        },
      },
    }),
  ]);

  if (!users.length) {
    return { totalCount, users: [], totalBalance: 0 };
  }

  const userIds = users.map((u) => u.id);

  /* ----------------------------------
   * 3. Aggregate ORDERS
   * ---------------------------------- */
  const [orderAgg, ongoingAgg] = await Promise.all([
    db.order.groupBy({
      by: ['userId'],
      where: {
        userId: { in: userIds },
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: {
        totalPrice: true,
        shippingFee: true,
        deposit: true,
      },
    }),
    db.order.groupBy({
      by: ['userId'],
      where: {
        userId: { in: userIds },
        status: { in: [OrderStatus.ONGOING, OrderStatus.LANDED_IN_CHINA] },
      },
      _count: { _all: true },
      _sum: {
        totalPrice: true,
        shippingFee: true,
        deposit: true,
      },
    }),
  ]);

  /* ----------------------------------
   * 4. Aggregate TRANSFERS
   * ---------------------------------- */
  const transferAgg = await db.transfered.groupBy({
    by: ['userId'],
    where: { userId: { in: userIds } },
    _sum: { amount: true },
  });

  /* ----------------------------------
   * 5. Build lookup maps
   * ---------------------------------- */
  const orderMap = new Map(orderAgg.map((o) => [o.userId, o]));
  const ongoingMap = new Map(ongoingAgg.map((o) => [o.userId, o]));
  const transferMap = new Map(transferAgg.map((t) => [t.userId, t]));

  /* ----------------------------------
   * 6. Merge + compute balance
   * ---------------------------------- */
  const usersWithBalance = users.map((u) => {
    const o = orderMap.get(u.id);
    const og = ongoingMap.get(u.id);
    const t = transferMap.get(u.id);

    const totalOrder = (o?._sum.totalPrice ?? 0) + (o?._sum.shippingFee ?? 0) - (o?._sum.deposit ?? 0);

    const totalTransfer = t?._sum.amount ?? 0;

    return {
      ...u,
      onGoingOrderCount: og?._count._all ?? 0,
      onGoingTotal: (og?._sum.totalPrice ?? 0) + (og?._sum.shippingFee ?? 0) - (og?._sum.deposit ?? 0),
      transfered: totalTransfer,
      balance: totalTransfer - totalOrder,
    };
  });

  /* ----------------------------------
   * 7. Compute TOTAL BALANCE (DB-level)
   * ---------------------------------- */
  const [orderTotalAgg, transferTotalAgg] = await Promise.all([
    db.order.aggregate({
      where: {
        status: { not: OrderStatus.CANCELLED },
        user: where,
      },
      _sum: {
        totalPrice: true,
        shippingFee: true,
        deposit: true,
      },
    }),
    db.transfered.aggregate({
      where: {
        user: where,
      },
      _sum: { amount: true },
    }),
  ]);

  const totalBalance =
    (transferTotalAgg._sum.amount ?? 0) -
    ((orderTotalAgg._sum.totalPrice ?? 0) + (orderTotalAgg._sum.shippingFee ?? 0) - (orderTotalAgg._sum.deposit ?? 0));

  /* ----------------------------------
   * 8. Optional sort by balance
   * ---------------------------------- */
  usersWithBalance.sort((a, b) => a.balance - b.balance);

  return {
    totalCount,
    users: usersWithBalance,
    totalBalance,
  };
};

const userWithBalance = (u: any) => {
  const orderList = (u.orders ?? []) as Order[];
  const transfereds = (u.transfers ?? []) as Transfered[];

  const totalPrice = orderList.reduce((sum, item) => sum + item.totalPrice + item.shippingFee - item.deposit, 0);

  const totalTransfered = transfereds.reduce((sum, item) => sum + item.amount, 0);

  const onGoingOrders: Order[] = u.orders.filter((item: Order) =>
    ([OrderStatus.ONGOING, OrderStatus.LANDED_IN_CHINA] as OrderStatus[]).includes(item.status)
  );

  return {
    ...u,
    onGoingOrderCount: onGoingOrders.length, // ongoing,
    onGoingTotal: onGoingOrders.reduce((acc, cur) => acc + cur.totalPrice - cur.deposit + cur.shippingFee, 0),
    transfered: totalTransfered,
    balance: totalTransfered - totalPrice,
  };
};

export const createUser = async (model: any, requestUser: RequestUser): Promise<User> => {
  const id = v4();
  const query: Prisma.UserCreateArgs = {
    data: {
      // SUPER => CREATE ADMIN ONLY: use generated ID
      // ADMIN => CREATE USER: use its own ADMIN ID
      adminId: requestUser.account.role === Role.ADMIN ? requestUser.id : id,
      phone: model.phone,
      email: model.email,
      fullName: model.fullName,
      id,
    },
  };

  if (model.willCreateAccount) {
    query.data.account = {
      create: {
        username: model.username,
        password: await hashPassword(model.password),
        role: model.role,
        id: v4(),
      },
    };
  }

  if (model.transferedAmount) {
    query.data.transfers = {
      create: {
        amount: model.transferedAmount,
        id: v4(),
      },
    };
  }

  return db.user.create(query);
};

export const updateUser = async (model: any): Promise<User> => {
  const query: Prisma.UserUpdateArgs = {
    where: { id: model.id },
    data: {
      phone: model.phone,
      email: model.email,
      fullName: model.fullName,
    },
  };

  if (model.willCreateAccount) {
    const accountData = {
      username: model.username,
      password: await hashPassword(model.password),
      role: model.role,
    };

    // Update existing account if it exists, otherwise create a new one.
    const existingAccount = await db.account.findFirst({ where: { userId: model.id } });

    if (existingAccount) {
      await db.account.update({
        where: { id: existingAccount.id },
        data: accountData,
      });
    } else {
      query.data.account = {
        create: {
          ...accountData,
          id: v4(),
        },
      };
    }
  }

  return db.user.update(query);
};

export const bulkCreateUser = async (names: string[], requestUser: RequestUser) => {
  return db.user.createMany({
    data: names.map((name) => ({ fullName: name, id: v4(), adminId: requestUser.id })),
  });
};

export const getAccountByUsername = async (
  username: string
): Promise<Omit<Account, 'createdAt' | 'updatedAt'> | null> => {
  return db.account.findUnique({
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
  const user = await db.user.findUnique({
    where: {
      id: id,
    },
    include: {
      transfers: {
        orderBy: { createdAt: 'desc' },
      },
      orders: {
        where: {
          status: {
            not: { equals: 'CANCELLED' },
          },
        },
        orderBy: { orderDate: 'desc' },
      },
      transactions: true,
      account: { omit: { password: true } },
    },
  });

  return userWithBalance(user);
};

export const getAccountById = async (id: string): Promise<Account | null> => {
  return db.account.findUnique({
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

export const bulkDeleteUser = async (ids: string[]): Promise<Prisma.BatchPayload> => {
  return db.user.deleteMany({
    where: {
      id: { in: ids },
    },
  });
};

export const deleteUser = async (id: string): Promise<void> => {
  await db.user.delete({
    where: {
      id,
    },
  });
};
