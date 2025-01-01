import { Author, Book, Order, ShippingStore, User } from '@prisma/client';

// _____________  Author Types  _____________

export type TAuthorID = Author['id'];
export type TAuthorRead = Omit<Author, 'createdAt' | 'updatedAt'>;
export type TAuthorWrite = Omit<Author, 'id' | 'createdAt' | 'updatedAt'>;

// _____________  Book Types  _____________

export type TBookID = Book['id'];
export type TBookRead = Pick<Book, 'id' | 'title' | 'datePublished' | 'isFiction'> & {
  author: TAuthorRead;
};
export type TBookWrite = Omit<Book, 'id' | 'createdAt' | 'updatedAt'>;

// _____________  User Types  _____________
export type TUserRegisterWrite = Omit<User, 'createdAt' | 'updatedAt'>;
export type TloginRead = Omit<User, 'createdAt' | 'updatedAt'>;
export type TloginRequest = Omit<User, 'createdAt' | 'updatedAt' | 'password'>;

// _____________  Shipping Store Types  _____________
export type TShippingStoreRequest = Omit<ShippingStore, 'createdAt' | 'updatedAt'>;

// _____________  Order Types  _____________
export type TOrderWrite = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;

export type QueryDataModel = {
  pagination: {
    pageSize: number;
    pageIndex: number;
    totalCount: number;
  };
  searchText?: string;
  sort?: { column: string; type: 'asc' | 'desc' };
  filter?: [{ column: string; value: any | any[] }];
};
