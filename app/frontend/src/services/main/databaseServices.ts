import ApiService from "../APIService";

export async function apiExportDatabase() {
  return ApiService.fetchData<BlobPart>({
    url: "/database/export",
    method: "get",
    responseType: "blob",
  });
}

export async function apiGetLastBackupTime() {
  return ApiService.fetchData<{
    success: boolean;
    data: { createdAt: string };
  }>({
    url: "/database/last-backup-time",
    method: "get",
  });
}
