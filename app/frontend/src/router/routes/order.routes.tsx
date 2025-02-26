/* eslint-disable react-refresh/only-export-components */
import { OrderStatus, Role } from "@/types/enum/app-enum";
import { lazy } from "react";

const OrderListPage = lazy(
  () => import("../../pages/private/order-list/OrderListPage")
);

export const orderRoutes = [
  {
    path: "/order-list",
    element: (
      <OrderListPage
        orderStatuses={[OrderStatus.ONGOING]}
        key="list"
        title="Danh sách đơn"
      />
    ),
    roles: [Role.ADMIN, Role.USER],
  },
  {
    path: "/complete-order-list",
    element: (
      <OrderListPage
        orderStatuses={[OrderStatus.LANDED, OrderStatus.SHIPPED]}
        key="complete"
        title="Danh sách hoàn tất"
      />
    ),
    roles: [Role.ADMIN, Role.USER],
  },
  {
    path: "/cancel-order-list",
    element: (
      <OrderListPage
        orderStatuses={[OrderStatus.CANCELLED]}
        key="canceled"
        title="Danh sách huỷ"
      />
    ),
    roles: [Role.ADMIN, Role.USER],
  },
];
