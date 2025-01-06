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
];
