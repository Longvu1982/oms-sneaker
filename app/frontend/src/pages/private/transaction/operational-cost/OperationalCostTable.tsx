import ComboBox from "@/components/combo-box/ComboBox";
import { DataTable } from "@/components/data-table/DataTable";
import { EnhancedColumnDef } from "@/components/data-table/dataTable.utils";
import { Input } from "@/components/ui/input";
import { formatAmount, renderBadge } from "@/lib/utils";
import { NatureType } from "@/types/enum/app-enum";
import {
  natureTypeOptions,
  OperationalCostItem,
} from "@/types/model/app-model";
import React, { FC, useMemo } from "react";
import { natureObject } from "../transaction-list/transaction-utils";

interface OperationalCostTableProps {
  data: OperationalCostItem[];
  isEdit: boolean;
  setData?: React.Dispatch<React.SetStateAction<OperationalCostItem[]>>;
}

const OperationalCostTable: FC<OperationalCostTableProps> = ({
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
          header: "Chi phí",
          cell: ({ row, getValue }) => {
            const id = row.original.id;
            return isEdit ? (
              <Input
                type="number"
                className="min-w-[100px]"
                value={getValue() as number}
                renderExtra={formatAmount}
                onChange={(value) => {
                  setData?.((prevData) =>
                    prevData.map((item) =>
                      item.id === id ? { ...item, amount: Number(value) } : item
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
            const props = natureObject[getValue() as NatureType] ?? {};
            const id = row.original.id;

            return isEdit ? (
              <ComboBox
                value={getValue() as NatureType}
                label="tính chất"
                searchable={false}
                onValueChange={(value) =>
                  setData?.((prev) =>
                    prev.map((item) => {
                      if (item.id === id) {
                        return {
                          ...item,
                          nature: value as NatureType,
                        };
                      }
                      return item;
                    })
                  )
                }
                options={natureTypeOptions.filter(
                  (item) => item.value === NatureType.OUT
                )}
                renderOption={(option) => {
                  const props = natureObject[option.value as NatureType] ?? {};
                  return renderBadge(props.color, option.label);
                }}
              />
            ) : (
              renderBadge(props.color, props.text)
            );
          },
        },
      ] as EnhancedColumnDef<OperationalCostItem>[],
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

export default OperationalCostTable;
