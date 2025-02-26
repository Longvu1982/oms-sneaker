import {
  BalanceNatureType,
  DeliveryCodeStatus,
  NatureType,
  OrderStatus,
  Role,
  TransactionType,
} from "../enum/app-enum";

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string; // Date as ISO string
  updatedAt: string; // Date as ISO string
  orders: Order[]; // Relationship
  account?: Account;
  transfered?: Transfered[];
};

export type Account = {
  id: string;
  username: string;
  password: string;
  role: Role;
  userId: string;
  createdAt: string; // Date as ISO string
  updatedAt: string; // Date as ISO string
};

export type Transfered = {
  id: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export type TransactionBalance = {
  dateTime: string;
  data: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  orderDate: Date; // Date as ISO string
  SKU: string;
  size: string;
  deposit: number;
  totalPrice: number;
  deliveryCode: string;
  deliveryCodeStatus: DeliveryCodeStatus;
  shippingFee: number;
  secondShippingFee: number;
  checkBox: boolean;
  userId: string;
  sourceId: string;
  shippingStoreId: string;
  status: OrderStatus;
  createdAt: string; // Date as ISO string
  updatedAt: string; // Date as ISO string
};

export type Transaction = {
  id: string;
  amount: number;
  rate: number;
  type: TransactionType;
  nature: NatureType;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TransactionWithExtra = Transaction & {
  user?: User;
};

export type Source = {
  id: string;
  name: string;
  createdAt: string; // Date as ISO string
  updatedAt: string; // Date as ISO string
  orders: Order[]; // Relationship
  color: string;
};

export type ShippingStore = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  createdAt: string; // Date as ISO string
  updatedAt: string; // Date as ISO string
  orders: Order[]; // Relationship
};

export type TransactionBalanceItem = {
  id: string;
  name: string;
  amount: number | null;
  rate: number | null;
  nature: BalanceNatureType;
};

export type QueryDataModel = {
  pagination: {
    pageSize: number;
    pageIndex: number;
    totalCount: number;
  };
  searchText?: string;
  sort?: { column: string; type: "asc" | "desc" };
  filter?: { column: string; value: A | A[] }[];
};

export const initQueryParams: QueryDataModel = {
  searchText: "",
  pagination: {
    pageSize: 100,
    pageIndex: 0,
    totalCount: 0,
  },
  filter: [] as unknown as [{ column: string; value: A | A[] }],
  sort: {} as unknown as { column: string; type: "asc" | "desc" },
};

export const deliveryCodeStatusOptions = [
  { label: "Chưa có MVĐ - chờ tạo", value: DeliveryCodeStatus.PENDING },
  { label: "Đã có MVĐ - chờ nhận", value: DeliveryCodeStatus.EXIST },
  { label: "Đã nhận", value: DeliveryCodeStatus.DELIVERD },
];

export const orderStatusOptions = [
  { label: "Đang giao", value: OrderStatus.ONGOING },
  { label: "Đã đến kho", value: OrderStatus.LANDED },
  { label: "Đã giao", value: OrderStatus.SHIPPED },
  { label: "Đã huỷ", value: OrderStatus.CANCELLED },
];

export const roleStatusOptions = [
  { label: "User", value: Role.USER },
  { label: "Staff", value: Role.STAFF },
  { label: "Admin", value: Role.ADMIN },
];

export const natureTypeOptions = [
  { label: "In", value: NatureType.IN },
  { label: "Out", value: NatureType.OUT },
];

export const transactionTypeOptions = [
  { label: "Mua tệ", value: TransactionType.BUY_CN },
  { label: "Bán tệ", value: TransactionType.SELL_CN },
  { label: "Mua PP", value: TransactionType.BUY_PP },
  { label: "Cancel-hoàn", value: TransactionType.CANCELLED },
];

export const balancenNtureTypeOptions = [
  { label: "In", value: BalanceNatureType.IN },
  { label: "Pending", value: BalanceNatureType.PENDING },
];
