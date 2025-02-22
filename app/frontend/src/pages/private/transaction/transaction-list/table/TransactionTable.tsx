import { DataTable } from "@/components/data-table/DataTable";
import { EnhancedColumnDef } from "@/components/data-table/dataTable.utils";
import { formatAmount, renderBadge } from "@/lib/utils";
import { NatureType, TransactionType } from "@/types/enum/app-enum";
import { QueryDataModel, TransactionWithExtra } from "@/types/model/app-model";
import { format } from "date-fns";
import { FC } from "react";
import { natureObject, transactionTypeObject } from "../transaction-utils";

const columns: EnhancedColumnDef<TransactionWithExtra>[] = [
  {
    accessorKey: "createdAt",
    header: "Ngày GD",
    cell: ({ getValue }) => {
      return (
        <div className="whitespace-nowrap">
          {format(getValue() as string, "dd/MM/yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Loại GD",
    cell: ({ getValue }) => {
      const { color, text } =
        transactionTypeObject[getValue() as TransactionType] ?? {};
      return renderBadge(color, text);
    },
  },
  {
    accessorKey: "user",
    header: "Tên khách",
    cell: ({ row }) => {
      const { user } = row.original;
      return <div className="whitespace-nowrap">{user?.fullName}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: "Số lượng",
  },
  {
    accessorKey: "rate",
    header: "Tỉ giá",
    cell: ({ getValue }) => {
      return formatAmount(getValue() as string);
    },
  },
  {
    id: "total",
    header: "Tổng",
    cell: ({
      row: {
        original: { amount, rate },
      },
    }) => {
      return formatAmount(amount * rate);
    },
  },
  {
    accessorKey: "nature",
    header: "Tính chất",
    cell: ({ getValue }) => {
      const { color, text } = natureObject[getValue() as NatureType] ?? {};
      return renderBadge(color, text);
    },
  },
];

interface TransactionTableProps {
  transactionList: TransactionWithExtra[];
  queryParams?: QueryDataModel;
  manualPagination?: boolean;
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
}

const TransactionTable: FC<TransactionTableProps> = ({
  transactionList,
  queryParams,
  onPaginationChange,
  manualPagination = true,
}) => {
  return (
    <DataTable
      columns={columns}
      data={transactionList}
      manualPagination={manualPagination}
      pagination={queryParams?.pagination}
      onPaginationChange={onPaginationChange}
    />
  );
};

export default TransactionTable;
