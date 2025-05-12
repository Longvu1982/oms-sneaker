import { OperationalCost } from "@/types/model/app-model";
import ApiService from "../APIService";

export async function apiAddOperationalCost(data: {
  amount: number;
  dateTime: Date | null;
}) {
  return ApiService.fetchData<{
    success: boolean;
    data: OperationalCost;
  }>({
    url: "/operational-cost/create",
    method: "post",
    data,
  });
}

export async function apiGetOperationalCostByDate(data: {
  dateTime: Date | null;
}) {
  return ApiService.fetchData<{
    success: boolean;
    data: OperationalCost;
  }>({
    url: "/operational-cost/get-by-date",
    method: "post",
    data,
  });
}
