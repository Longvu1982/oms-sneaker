/* eslint-disable react-refresh/only-export-components */
import { Role } from "@/types/enum/app-enum";
import { lazy } from "react";

const TransactionListPage = lazy(
  () =>
    import("@/pages/private/transaction/transaction-list/TransactionListPage")
);

const TransactionBalancePage = lazy(
  () =>
    import(
      "@/pages/private/transaction/transaction-balance/TransactionBalancePage"
    )
);

const OperationalCostPage = lazy(
  () =>
    import("@/pages/private/transaction/operational-cost/OperationalCostPage")
);

export const transactionRoutes = [
  {
    path: "/transaction-list",
    element: <TransactionListPage />,
    roles: [Role.ADMIN],
  },
  {
    path: "/transaction-balance",
    element: <TransactionBalancePage />,
    roles: [Role.ADMIN],
  },
  {
    path: "/operational-cost",
    element: <OperationalCostPage />,
    roles: [Role.ADMIN],
  },
];
