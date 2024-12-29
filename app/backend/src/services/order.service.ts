import { db } from '../utils/db.server';
import { QueryDataModel, TBookID, TBookRead, TBookWrite } from '../types/general';
import { Order, Prisma } from '@prisma/client';
export const listOrders = async (model: QueryDataModel): Promise<{ totalCount: number; orders: Order[] }> => {
  const { pagination, searchText, sort, filter } = model;

  const { pageSize, pageIndex } = pagination;
  // Infer query type from Prisma
  const query: Prisma.OrderFindManyArgs = {
    skip: pageIndex * pageSize, // Paging: Calculate the offset
    take: pageSize, // Paging: Limit to the page size
    include: { user: { omit: { password: true } }, shippingStore: true, source: true },
    where: {}, // Filtering conditions will be added dynamically
    orderBy: {}, // Sorting conditions will be added dynamically
  };

  // Filtering
  if (filter) {
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
        { orderNumber: { contains: searchText, mode: 'insensitive' } },
        { SKU: { contains: searchText, mode: 'insensitive' } },
      ],
    };
  }

  // Sorting
  if (sort) {
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

export const createBook = async (book: TBookWrite): Promise<TBookRead> => {
  const { title, authorId, datePublished, isFiction } = book;
  const parsedDate: Date = new Date(datePublished);

  return db.book.create({
    data: {
      title,
      authorId,
      isFiction,
      datePublished: parsedDate,
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

export const deleteBook = async (id: TBookID): Promise<void> => {
  await db.book.delete({
    where: {
      id,
    },
  });
};
