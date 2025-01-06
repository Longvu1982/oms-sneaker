import { TransactionBalance } from "@/types/model/app-model";
import ApiService from "../APIService";

export async function apiAddTransactionBalance(data: {
  data: string;
  dateTime: Date | null;
}) {
  return ApiService.fetchData<{
    success: boolean;
    data: TransactionBalance;
  }>({
    url: "/transaction-balance/create",
    method: "post",
    data,
  });
}

export async function apiGetTransactionBalanceByDate(data: {
  dateTime: Date | null;
}) {
  return ApiService.fetchData<{
    success: boolean;
    data: TransactionBalance;
  }>({
    url: "/transaction-balance/get-by-date",
    method: "post",
    data,
  });
}
