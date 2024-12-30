/* eslint-disable react-refresh/only-export-components */
import { Role } from "@/types/enum/app-enum";
import { lazy } from "react";

const OrderListPage = lazy(
  () => import("../../pages/private/order-list/OrderListPage")
);

export const orderRoutes = [
  {
    path: "/order-list",
    element: <OrderListPage isCompleted={false} key={"list"} />,
    roles: [Role.ADMIN],
  },
  {
    path: "/complete-order-list",
    element: <OrderListPage isCompleted key={"complete"} />,
    roles: [Role.ADMIN],
  },
];
