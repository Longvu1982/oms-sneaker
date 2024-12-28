/* eslint-disable react-refresh/only-export-components */
import React, { lazy } from "react";

const Test1 = lazy(() => import("../../pages/private/test1/Test1"));
const Test2 = lazy(() => import("../../pages/private/test2/Test2"));

export const route1Route = [
  {
    path: "/route1",
    element: (
      <React.Suspense fallback={"loading..."}>
        <Test1 />
      </React.Suspense>
    ),

    roles: [1],
  },
  {
    path: "/route2",
    element: (
      <React.Suspense fallback={"loading..."}>
        <Test2 />
      </React.Suspense>
    ),

    roles: [1],
  },
];
