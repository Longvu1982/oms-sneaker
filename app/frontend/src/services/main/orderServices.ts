import { OrderFormValues } from "@/pages/private/order-list/panel/OrderPanel";
import {
  Order,
  QueryDataModel,
  ShippingStore,
  Source,
  User,
} from "@/types/model/app-model";
import ApiService from "../APIService";
import { OrderStatus } from "@/types/enum/app-enum";

export type OrderWithExtra = Order & {
  user: User;
  shippingStore: ShippingStore;
  source: Source;
};

export async function apiGetOrderList(data: QueryDataModel) {
  return ApiService.fetchData<{
    success: boolean;
    data: { orders: OrderWithExtra[]; totalCount: number };
  }>({
    url: "/orders/list",
    method: "post",
    data,
  });
}

export async function apiCreateOrder(
  data: Omit<Order, "id" | "createdAt" | "updatedAt">
) {
  return ApiService.fetchData<{
    success: boolean;
    data: Order;
  }>({
    url: "/orders/create",
    method: "post",
    data,
  });
}

export async function apiBulkCreateOrder(data: {
  orders: Omit<Order, "id" | "createdAt" | "updatedAt"> & {
    userName: string;
    shippingStoreName: string;
    sourceName: string;
  };
}) {
  return ApiService.fetchData<{
    success: boolean;
    data: { orders: Order[] };
  }>({
    url: "/orders/create/bulk",
    method: "post",
    data,
  });
}

export async function apiBulkUpdateOrderStatus(data: {
  ids: string[];
  status: OrderStatus;
}) {
  return ApiService.fetchData<{
    success: boolean;
    data: { orders: Order[] };
  }>({
    url: "/orders/update-status/bulk",
    method: "put",
    data,
  });
}

export async function apiDeleteOrder(data: { id: string }) {
  return ApiService.fetchData<{
    success: boolean;
  }>({
    url: "/orders/delete",
    method: "post",
    data,
  });
}

export async function apiBulkDeleteOrder(data: { ids: string[] }) {
  return ApiService.fetchData<{
    success: boolean;
  }>({
    url: "/orders/delete/bulk",
    method: "post",
    data,
  });
}

export async function apiUpdateOrder(data: OrderFormValues) {
  return ApiService.fetchData<{
    success: boolean;
    data: Order;
  }>({
    url: `/orders/${data.id}/update`,
    method: "put",
    data,
  });
}

export async function apiCheckUserNamesExist(data: { names: string[] }) {
  return ApiService.fetchData<{
    success: boolean;
    data: string[];
  }>({
    url: `/orders/create/check-missing-user-names`,
    method: "post",
    data,
  });
}
