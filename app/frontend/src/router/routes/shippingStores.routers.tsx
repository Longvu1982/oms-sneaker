/* eslint-disable react-refresh/only-export-components */
import { Role } from "@/types/enum/app-enum";
import { lazy } from "react";

const ShippingStoreListPage = lazy(
  () => import("@/pages/private/shipping-store-list/ShippingStoreListPage")
);

export const shippingStoreRoutes = [
  {
    path: "/shipping-store-list",
    element: <ShippingStoreListPage />,
    roles: [Role.ADMIN],
  },
];
