/* eslint-disable react-refresh/only-export-components */
import { Role } from "@/types/enum/app-enum";
import { lazy } from "react";

const SourceListPage = lazy(
  () => import("@/pages/private/source-list/SourceListPage")
);

export const sourceRoutes = [
  {
    path: "/source-list",
    element: <SourceListPage />,
    roles: [Role.ADMIN],
  },
];
