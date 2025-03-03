/* eslint-disable react-refresh/only-export-components */
import { Role } from "@/types/enum/app-enum";
import { lazy } from "react";

const UserListPage = lazy(
  () => import("@/pages/private/user-list/UserListPage")
);

const UserDetailsPage = lazy(
  () => import("@/pages/private/user-detail/UserDetailsPage")
);

export const userRoutes = [
  {
    path: "/user-list",
    element: <UserListPage />,
    roles: [Role.ADMIN, Role.USER],
  },
  {
    path: "/user-list/:userId",
    element: <UserDetailsPage />,
    roles: [Role.ADMIN, Role.USER],
  },
];
