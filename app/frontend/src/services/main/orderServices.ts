import { OrderFormValues } from "@/pages/private/order-list/panel/OrderPanel";
import {
  Order,
  QueryDataModel,
  ShippingStore,
  Source,
  User,
} from "@/types/model/app-model";
import ApiService from "../APIService";

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
