/// <reference types="vite/client" />

import "@tanstack/react-table";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type A = any;
}
declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    onClickAddTransfer: (user: TData) => void;
    onClickFullname: (id: string) => void;
    onClickEditUser: (user: TData) => void;
    onClickEditSource: (source: TData) => void;
    onEditTransactionClick: (data: TransactionWithExtra) => void;
    onDeleteTransactionClick: (id: string) => void;
    onDeleteUserClick: (id: string) => void;
    onChangeOrderCheckBox: (id: string, checked: boolean) => void;
    onReload: () => Promise<void>;
  }
}
