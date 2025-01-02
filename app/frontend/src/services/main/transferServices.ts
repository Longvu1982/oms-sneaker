import { Transfered } from "@/types/model/app-model";
import ApiService from "../APIService";

export async function apiAddTransfer(data: {
  amount: number;
  createdAt: Date | null;
  userId: string;
}) {
  return ApiService.fetchData<{
    success: boolean;
    data: Transfered;
  }>({
    url: "/transfer/create",
    method: "post",
    data,
  });
}
