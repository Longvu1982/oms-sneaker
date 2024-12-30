import { QueryDataModel, ShippingStore } from "@/types/model/app-model";
import ApiService from "../APIService";

export async function apiShippingStoresList(data: QueryDataModel) {
  return ApiService.fetchData<{
    success: boolean;
    data: { shippingStores: ShippingStore[]; totalCount: number };
  }>({
    url: "/shippingStores/list",
    method: "post",
    data,
  });
}
