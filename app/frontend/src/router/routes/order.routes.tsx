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
        type="list"
        title="Danh sách đang giao"
      />
    ),
    roles: [Role.ADMIN, Role.USER],
  },
  {
    path: "/landed-order-list",
    element: (
      <OrderListPage
        orderStatuses={[OrderStatus.LANDED, OrderStatus.LANDED_IN_CHINA]}
        key="landed"
        type="landed"
        title="Danh sách đến kho"
      />
    ),
    roles: [Role.ADMIN, Role.USER],
  },
  {
    path: "/complete-order-list",
    element: (
      <OrderListPage
        orderStatuses={[OrderStatus.SHIPPED]}
        key="complete"
        type="complete"
        title="Danh sách đã giao"
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
        type="canceled"
        title="Danh sách huỷ"
      />
    ),
    roles: [Role.ADMIN, Role.USER],
  },
];
