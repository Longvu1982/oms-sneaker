import { DataTable } from "@/components/data-table/DataTable";
import { EnhancedColumnDef } from "@/components/data-table/dataTable.utils";
import { formatAmount, renderBadge } from "@/lib/utils";
import { NatureType, TransactionType } from "@/types/enum/app-enum";
import { QueryDataModel, TransactionWithExtra } from "@/types/model/app-model";
import { format } from "date-fns";
import { FC, useMemo } from "react";
import { natureObject, transactionTypeObject } from "../transaction-utils";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { RowSelectionState } from "@tanstack/react-table";

const columns: EnhancedColumnDef<TransactionWithExtra>[] = [
  {
    id: "createdAt",
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
    id: "type",
    accessorKey: "type",
    header: "Loại GD",
    cell: ({ getValue }) => {
      const { color, text } =
        transactionTypeObject[getValue() as TransactionType] ?? {};
      return renderBadge(color, text);
    },
  },
  {
    id: "user",
    accessorKey: "user",
    header: "Tên khách",
    cell: ({ row }) => {
      const { user } = row.original;
      return <div className="whitespace-nowrap">{user?.fullName}</div>;
    },
  },
  {
    id: "amount",
    accessorKey: "amount",
    header: "Số lượng",
  },
  {
    id: "rate",
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
    id: "nature",
    accessorKey: "nature",
    header: "Tính chất",
    cell: ({ getValue }) => {
      const { color, text } = natureObject[getValue() as NatureType] ?? {};
      return renderBadge(color, text);
    },
  },
  {
    id: "actions",
    fixed: true,
    cell: ({ table, row }) => {
      const onEditTransactionClick = table.options.meta?.onEditTransactionClick;
      const onDeleteTransactionClick =
        table.options.meta?.onDeleteTransactionClick;

      return (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEditTransactionClick?.(row.original)}
          >
            <Edit />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDeleteTransactionClick?.(row.original.id)}
          >
            <Trash className="text-red-500" />
          </Button>
        </div>
      );
    },
  },
];

interface TransactionTableProps {
  transactionList: TransactionWithExtra[];
  queryParams?: QueryDataModel;
  manualPagination?: boolean;
  onPaginationChange?: (pagination: {
    pageIndex: number;
    pageSize: number;
  }) => void;
  onEditTransactionClick?: (data: TransactionWithExtra) => void;
  onDeleteTransactionClick?: (id: string) => void;
  selectedRows?: RowSelectionState;
  onRowSelectionChange?: (newSelection: RowSelectionState) => void;
  excludeColumns?: string[];
}

const TransactionTable: FC<TransactionTableProps> = ({
  transactionList,
  queryParams,
  onPaginationChange,
  onEditTransactionClick,
  onDeleteTransactionClick,
  selectedRows,
  onRowSelectionChange,
  excludeColumns = [],
  manualPagination = true,
}) => {
  const filteredColumns = useMemo(() => {
    return columns.filter(
      (column) => !excludeColumns.includes(column.id as string)
    );
  }, [excludeColumns]);

  return (
    <DataTable
      columns={filteredColumns}
      data={transactionList}
      manualPagination={manualPagination}
      pagination={queryParams?.pagination}
      onPaginationChange={onPaginationChange}
      meta={{ onEditTransactionClick, onDeleteTransactionClick }}
      selectedRows={selectedRows}
      onRowSelectionChange={onRowSelectionChange}
    />
  );
};

export default TransactionTable;
