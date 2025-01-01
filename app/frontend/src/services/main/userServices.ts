import { QueryDataModel, User } from "@/types/model/app-model";
import ApiService from "../APIService";

export type UserFormValues = Omit<
  User,
  "id" | "createdAt" | "updatedAt" | "transfered" | "orders"
> & {
  transferedAmount?: number;
  willCreateAccount: boolean;
  username: string;
  password: string;
};

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

export async function apiGetUsersListDetails(data: QueryDataModel) {
  return ApiService.fetchData<{
    success: boolean;
    data: { users: User[]; totalCount: number };
  }>({
    url: "/users/list-detail",
    method: "post",
    data,
  });
}

export async function apiCreateUser(data: UserFormValues) {
  return ApiService.fetchData<{
    success: boolean;
    data: User;
  }>({
    url: "/users/create",
    method: "post",
    data,
  });
}
