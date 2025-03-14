import { QueryDataModel, ShippingStore } from "@/types/model/app-model";
import ApiService from "../APIService";

export type ShippingStoreFormValues = Omit<
  ShippingStore,
  "id" | "createdAt" | "updatedAt"
> & { id?: string };

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

export async function apiCreateShippingStore(
  data: Omit<ShippingStore, "id" | "createdAt" | "updatedAt">
) {
  return ApiService.fetchData<{
    success: boolean;
    data: ShippingStore;
  }>({
    url: "/shippingStores/create",
    method: "post",
    data,
  });
}

export async function apiUpdateShippingStore(data: ShippingStoreFormValues) {
  return ApiService.fetchData<{
    success: boolean;
    data: ShippingStore;
  }>({
    url: `/shippingStores/${data.id}/update`,
    method: "post",
    data,
  });
}
