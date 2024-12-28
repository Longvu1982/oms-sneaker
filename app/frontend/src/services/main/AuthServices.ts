import ApiService from "../APIService";

export async function apiLogIn(data: A | undefined) {
  return ApiService.fetchData<A>({
    url: "/auth/login",
    method: "post",
    data,
  });
}

export async function apiAuthMe() {
  return ApiService.fetchData<A>({
    url: "/auth/me",
    method: "post",
  });
}
