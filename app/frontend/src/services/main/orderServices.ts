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
