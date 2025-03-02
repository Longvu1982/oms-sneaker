import { Order, ShippingStore, Transaction, User } from '@prisma/client';

// _____________  User Types  _____________
export type TUserRegisterWrite = Omit<User, 'createdAt' | 'updatedAt'>;
export type TloginRead = Omit<User, 'createdAt' | 'updatedAt'>;
export type TloginRequest = Omit<User, 'createdAt' | 'updatedAt' | 'password'>;

// _____________  Shipping Store Types  _____________
export type TShippingStoreRequest = Omit<ShippingStore, 'createdAt' | 'updatedAt'>;

// _____________  Order Types  _____________
export type TOrderWrite = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;
export type TBulkOrderWrite = Omit<
  Order,
  'id' | 'createdAt' | 'updatedAt' | 'userId' | 'sourceId' | 'shippingStoreId'
> & {
  userName: string;
  shippingStoreName: string;
  sourceName: string;
};
export type TTransactionWrite = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;

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
