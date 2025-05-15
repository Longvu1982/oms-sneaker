import ComboBox from "@/components/combo-box/ComboBox";
import { DataTable } from "@/components/data-table/DataTable";
import { EnhancedColumnDef } from "@/components/data-table/dataTable.utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatAmount, renderBadge } from "@/lib/utils";
import { BalanceNatureType } from "@/types/enum/app-enum";
import {
  balancenNtureTypeOptions,
  TransactionBalanceItem,
} from "@/types/model/app-model";
import { Trash } from "lucide-react";
import React, { FC, useMemo } from "react";
import { balanceNatureObject } from "../transaction-list/transaction-utils";

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
          cell: ({ getValue, row }) => {
            const id = row.original.id;
            return isEdit ? (
              <Input
                className="min-w-[100px]"
                value={getValue() as string}
                onChange={(e) => {
                  setData?.((prevData) =>
                    prevData.map((item) =>
                      item.id === id ? { ...item, name: e.target.value } : item
                    )
                  );
                }}
              />
            ) : (
              (getValue() as string)
            );
          },
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
                renderExtra={formatAmount}
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
              formatAmount(getValue() as number)
            );
          },
        },
        {
          id: "nature",
          accessorKey: "nature",
          header: "Tính chất",
          cell: ({ getValue, row }) => {
            const props =
              balanceNatureObject[getValue() as BalanceNatureType] ?? {};
            const id = row.original.id;

            return isEdit ? (
              <ComboBox
                value={getValue() as BalanceNatureType}
                label="tính chất"
                searchable={false}
                onValueChange={(value) =>
                  setData?.((prev) =>
                    prev.map((item) => {
                      if (item.id === id) {
                        return {
                          ...item,
                          nature: value as BalanceNatureType,
                        };
                      }
                      return item;
                    })
                  )
                }
                options={balancenNtureTypeOptions}
                renderOption={(option) => {
                  const props =
                    balanceNatureObject[option.value as BalanceNatureType] ??
                    {};
                  return renderBadge(props.color, option.label);
                }}
              />
            ) : (
              renderBadge(props.color, props.text)
            );
          },
        },
        ...(isEdit
          ? [
              {
                id: "actions",
                cell: ({ row }: A) => {
                  const id = row.original.id;

                  const onDelete = () =>
                    setData?.((prev) => prev.filter((item) => item.id !== id));

                  return (
                    <Button variant="outline" size="icon" onClick={onDelete}>
                      <Trash className="text-red-500" />
                    </Button>
                  );
                },
              },
            ]
          : []),
      ] as EnhancedColumnDef<TransactionBalanceItem>[],
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
