import {
  QueryDataModel,
  Transaction,
  TransactionWithExtra,
} from "@/types/model/app-model";
import ApiService from "../APIService";

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
