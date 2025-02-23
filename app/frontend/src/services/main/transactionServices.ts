import {
  QueryDataModel,
  Transaction,
  TransactionWithExtra,
} from "@/types/model/app-model";
import ApiService from "../APIService";

export type TransactionFormValues = Omit<
  Transaction,
  "id" | "createdAt" | "updatedAt"
> & {
  id?: string;
};

export async function apiCreateTransaction(
  data: Omit<Transaction, "id" | "createdAt" | "updatedAt">
) {
  return ApiService.fetchData<{
    success: boolean;
    data: Transaction;
  }>({
    url: "/transactions/create",
    method: "post",
    data,
  });
}

export async function apiUpdateTransaction(data: TransactionFormValues) {
  return ApiService.fetchData<{
    success: boolean;
    data: Transaction;
  }>({
    url: `/transactions/${data.id}/update`,
    method: "put",
    data,
  });
}

export async function apiGetTransactionList(data: QueryDataModel) {
  return ApiService.fetchData<{
    success: boolean;
    data: { transactions: TransactionWithExtra[]; totalCount: number };
  }>({
    url: "/transactions/list",
    method: "post",
    data,
  });
}

export async function apiDeleteTransaction(data: { id: string }) {
  return ApiService.fetchData<{
    success: boolean;
  }>({
    url: "/transactions/delete",
    method: "post",
    data,
  });
}

export async function apiBulkDeleteTransaction(data: { ids: string[] }) {
  return ApiService.fetchData<{
    success: boolean;
  }>({
    url: "/transactions/delete/bulk",
    method: "post",
    data,
  });
}
