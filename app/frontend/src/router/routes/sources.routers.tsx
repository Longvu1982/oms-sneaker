/* eslint-disable react-refresh/only-export-components */
import { Role } from "@/types/enum/app-enum";

export const sourceRoutes = [
  {
    path: "/source-list",
    element: <>Haha</>,
    roles: [Role.ADMIN],
  },
  {
    path: "/complete-order-list",
    element: <></>,
    roles: [Role.ADMIN],
  },
];
