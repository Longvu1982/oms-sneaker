/* eslint-disable react-refresh/only-export-components */
import { Role } from "@/types/enum/app-enum";
import { lazy } from "react";

const OrderListPage = lazy(
  () => import("../../pages/private/order-list/OrderListPage")
);

export const orderRoutes = [
  {
    path: "/order-list",
    element: <OrderListPage />,
    roles: [Role.ADMIN],
  },
];
