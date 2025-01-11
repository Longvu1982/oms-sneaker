import { DataTable } from "@/components/data-table/DataTable";
import { EnhancedColumnDef } from "@/components/data-table/dataTable.utils";
import { Input } from "@/components/ui/input";
import { renderBadge } from "@/lib/utils";
import { TransactionBalanceItem } from "@/types/model/app-model";
import React, { FC, useMemo } from "react";

interface TransactionBalanceTableProps {
  data: TransactionBalanceItem[];
  isEdit: boolean;
  setData?: React.Dispatch<React.SetStateAction<TransactionBalanceItem[]>>;
}

const TransactionBalanceTable: FC<TransactionBalanceTableProps> = ({
  isEdit,
  setData,
  data,
}) => {
  const columns = useMemo(
    () =>
      [
        {
          id: "STT",
          header: "STT",
          cell: ({ row }) => {
            return <div>{row.index + 1}</div>;
          },
        },
        {
          accessorKey: "name",
          header: "Loại",
          cell: ({ getValue }) => (
            <span className="whitespace-nowrap">{getValue() as string}</span>
          ),
        },
        {
          accessorKey: "amount",
          header: "Số lượng",
          cell: ({ row, getValue }) => {
            const name = row.original.name;
            return isEdit ? (
              <Input
                type="number"
                className="min-w-[100px]"
                value={getValue() as number}
                onChange={(value) => {
                  setData?.((prevData) =>
                    prevData.map((item) =>
                      item.name === name
                        ? { ...item, amount: Number(value) }
                        : item
                    )
                  );
                }}
              />
            ) : (
              (getValue() as number)
            );
          },
        },
        {
          accessorKey: "rate",
          header: "Tỉ giá",
          cell: ({ row, getValue }) => {
            const name = row.original.name;
            return isEdit ? (
              <Input
                type="number"
                className="min-w-[100px]"
                value={getValue() as number}
                onChange={(value) => {
                  setData?.((prevData) =>
                    prevData.map((item) =>
                      item.name === name
                        ? { ...item, rate: Number(value) }
                        : item
                    )
                  );
                }}
              />
            ) : (
              (getValue() as number)
            );
          },
        },
        {
          id: "props",
          header: "Tính chất",
          cell: () => renderBadge("#90EE90", "In"),
        },
      ] as EnhancedColumnDef<{
        name: string;
        amount: number | null;
        rate: number | null;
      }>[],
    [isEdit, setData]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      manualPagination={false}
      showPagination={false}
    />
  );
};

export default TransactionBalanceTable;
