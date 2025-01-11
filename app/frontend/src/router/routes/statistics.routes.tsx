/* eslint-disable react-refresh/only-export-components */
import { Role } from "@/types/enum/app-enum";
import { lazy } from "react";

const StatisticPage = lazy(
  () => import("@/pages/private/statistic/StatisticPage")
);

export const statisticRoutes = [
  {
    path: "/statistics",
    element: <StatisticPage />,
    roles: [Role.ADMIN],
  },
];
