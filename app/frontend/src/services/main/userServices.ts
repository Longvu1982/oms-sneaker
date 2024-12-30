import { QueryDataModel, User } from "@/types/model/app-model";
import ApiService from "../APIService";

export async function apiGetUsersList(data: QueryDataModel) {
  return ApiService.fetchData<{
    success: boolean;
    data: { users: User[]; totalCount: number };
  }>({
    url: "/users/list",
    method: "post",
    data,
  });
}
