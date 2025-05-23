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

export const listUsersDetail = async (
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

const userWithBalance = (u: any) => {
  const orderList = (u.orders ?? []) as Order[];
  const transfereds = (u.transfers ?? []) as Transfered[];

  const totalPrice = orderList.reduce((sum, item) => sum + item.totalPrice + item.shippingFee - item.deposit, 0);

  const totalTransfered = transfereds.reduce((sum, item) => sum + item.amount, 0);

  const onGoingOrders: Order[] = u.orders.filter((item: Order) => item.status === OrderStatus.ONGOING);

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
