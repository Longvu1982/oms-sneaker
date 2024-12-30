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

export async function apiUpdateOrderStatus(data: {
  id: string;
  status: OrderStatus;
}) {
  return ApiService.fetchData<{
    success: boolean;
    data: Order;
  }>({
    url: `/orders/${data.id}/changeStatus`,
    method: "put",
    data,
  });
}
