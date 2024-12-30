import { DeliveryCodeStatus, OrderStatus, Role } from "../enum/app-enum";

export type User = {
  id: string;
  fullName: string;
  username: string;
  password: string;
  email: string;
  role: Role;
  phone?: string | null;
  balance: number;
  createdAt: string; // Date as ISO string
  updatedAt: string; // Date as ISO string
  orders: Order[]; // Relationship
};

export type Order = {
  id: string;
  orderNumber: string;
  orderDate: string; // Date as ISO string
  SKU: string;
  size: number;
  deposit: number;
  totalPrice: number;
  deliveryCode: string;
  deliveryCodeStatus: DeliveryCodeStatus;
  shippingFee: number;
  checkBox: boolean;
  userId: string;
  sourceId: string;
  shippingStoreId: string;
  status: OrderStatus;
  createdAt: string; // Date as ISO string
  updatedAt: string; // Date as ISO string
};

export type Source = {
  id: string;
  name: string;
  createdAt: string; // Date as ISO string
  updatedAt: string; // Date as ISO string
  orders: Order[]; // Relationship
};

export type ShippingStore = {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  createdAt: string; // Date as ISO string
  updatedAt: string; // Date as ISO string
  orders: Order[]; // Relationship
};

export type QueryDataModel = {
  pagination: {
    pageSize: number;
    pageIndex: number;
    totalCount: number;
  };
  searchText?: string;
  sort?: { column: string; type: "asc" | "desc" };
  filter?: [{ column: string; value: A | A[] }];
};

export const initQueryParams: QueryDataModel = {
  searchText: "",
  pagination: {
    pageSize: 10,
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
