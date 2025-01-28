import {
  Account,
  Order,
  QueryDataModel,
  Transaction,
  Transfered,
  User,
} from "@/types/model/app-model";
import ApiService from "../APIService";
import { Role } from "@/types/enum/app-enum";

export type UserFormValues = Omit<
  User,
  "id" | "createdAt" | "updatedAt" | "transfered" | "orders"
> & {
  transferedAmount?: number;
  willCreateAccount: boolean;
  username: string;
  password: string;
  role: Role;
};

export type UserExtra = User & {
  transactions: Transaction[];
  transfers: Transfered[];
  orders: Order[];
  account?: Account;
  orderCount: number;
  transfered: number;
  balance: number;
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

export async function getUserById(id: string) {
  return ApiService.fetchData<{
    success: boolean;
    data: UserExtra;
  }>({
    url: `/users/${id}`,
    method: "get",
  });
}
