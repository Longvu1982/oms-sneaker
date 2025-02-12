import { QueryDataModel, Source } from "@/types/model/app-model";
import ApiService from "../APIService";

export async function apiSourcesList(data: QueryDataModel) {
  return ApiService.fetchData<{
    success: boolean;
    data: { sources: Source[]; totalCount: number };
  }>({
    url: "/sources/list",
    method: "post",
    data,
  });
}

export async function apiCreateSource(data: { name: string; color: string }) {
  return ApiService.fetchData<{
    success: boolean;
    data: Source;
  }>({
    url: "/sources/create",
    method: "post",
    data,
  });
}

export async function apiUpdateSource(data: {
  id?: string;
  name: string;
  color: string;
}) {
  return ApiService.fetchData<{
    success: boolean;
    data: Source;
  }>({
    url: `/sources/${data.id}/update`,
    method: "post",
    data,
  });
}
