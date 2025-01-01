/* eslint-disable react-refresh/only-export-components */
import { Role } from "@/types/enum/app-enum";
import { lazy } from "react";

const Test1 = lazy(() => import("../../pages/private/test1/Test1"));
const Test2 = lazy(() => import("../../pages/private/test2/Test2"));

export const route1Route = [
  {
    path: "/route1",
    element: <Test1 />,

    roles: [Role.ADMIN],
  },
  {
    path: "/route2",
    element: <Test2 />,

    roles: [Role.ADMIN],
  },
];
