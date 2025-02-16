import ComboBox from "@/components/combo-box/ComboBox";
import { EnhancedColumnDef } from "@/components/data-table/dataTable.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAmount, renderBadge } from "@/lib/utils";
import { OrderWithExtra } from "@/services/main/orderServices";
import useAuthStore from "@/store/auth";
import { OrderStatus, Role } from "@/types/enum/app-enum";
import {
  orderStatusOptions,
  ShippingStore,
  Source,
} from "@/types/model/app-model";
import { format } from "date-fns/format";
import { Edit, Trash } from "lucide-react";
import { useMemo } from "react";
import {
  deliveryCodeStatusObject,
  orderStatusObject,
} from "./order-list-utils";

type getOrdercolumnsProps = {
  onStatusChange?: (id: string, status: OrderStatus) => Promise<A>;
  onEditClick?: (data: OrderWithExtra) => void;
  onDeleteClick?: (data: OrderWithExtra) => void;
  excludeColumns?: string[];
};

export const useGetOrderColumns: (
  props: getOrdercolumnsProps
) => EnhancedColumnDef<OrderWithExtra>[] = ({
  onStatusChange,
  onEditClick,
  onDeleteClick,
  excludeColumns,
}) => {
  const role = useAuthStore((s) => s.user?.account.role);
  const columns = useMemo(
    () =>
      [
        {
          id: "orderDate",
          accessorKey: "orderDate",
          header: "Ngày order",
          cell: ({ getValue }) => {
            return (
              <div className="whitespace-nowrap">
                {format(getValue() as string, "dd/MM/yyyy")}
              </div>
            );
          },
        },
        {
          id: "statusChangeDate",
          accessorKey: "statusChangeDate",
          header: () => (
            <p>
              <span className="whitespace-nowrap">Ngày chuyển</span>
              <br />
              <span className="whitespace-nowrap">trạng thái</span>
            </p>
          ),
          cell: ({ getValue }) => {
            return (
              <div className="whitespace-nowrap min-w-[120px]">
                {getValue() ? format(getValue() as string, "dd/MM/yyyy") : ""}
              </div>
            );
          },
        },
        {
          id: "SKU",
          accessorKey: "SKU",
          header: "SKU",
        },
        {
          id: "size",
          accessorKey: "size",
          header: "Size",
        },
        {
          id: "deposit",
          accessorKey: "deposit",
          header: "Cọc",
          cell: ({ getValue }) => formatAmount(getValue() as number),
        },
        {
          id: "totalPrice",
          accessorKey: "totalPrice",
          header: "Giá",
          cell: ({ getValue }) => formatAmount(getValue() as number),
        },
        {
          id: "user",
          accessorKey: "user",
          header: "Tên khách",
          cell: ({ row }) => {
            const { user } = row.original;
            return <div className="whitespace-nowrap">{user.fullName}</div>;
          },
        },
        {
          id: "orderNumber",
          accessorKey: "orderNumber",
          header: "Order number",
          cell: ({ getValue }) => (
            <p className="break-all md:break-normal">{getValue() as string}</p>
          ),
        },
        {
          id: "deliveryCode",
          accessorKey: "deliveryCode",
          header: "MVĐ",
          cell: ({ row }) => {
            const order = row.original;
            const { deliveryCodeStatus, deliveryCode } = order;

            const codeText = deliveryCode || "Chưa có MVĐ";
            return (
              <Badge
                className="whitespace-nowrap py-1"
                variant="outline"
                style={{
                  background:
                    deliveryCodeStatusObject[deliveryCodeStatus]?.color,
                }}
              >
                {codeText} :{" "}
                {deliveryCodeStatusObject[deliveryCodeStatus]?.text}
              </Badge>
            );
          },
        },
        // {
        //   id: "checkBox",
        //   accessorKey: "checkBox",
        //   header: "Hộp kiểm",
        //   cell: ({ getValue }) => {
        //     const isChecked = getValue() as boolean;
        //     return isChecked ? <Checkbox checked /> : <></>;
        //   },
        // },
        {
          id: "source",
          accessorKey: "source",
          header: "Nguồn",
          cell: ({ getValue }) => {
            const source = getValue() as Source;
            return renderBadge(source.color, source.name);
          },
        },
        {
          id: "shippingFee",
          accessorKey: "shippingFee",
          header: "Cước VC",
          cell: ({ getValue }) => formatAmount(getValue() as number),
        },
        {
          id: "shippingStore",
          accessorKey: "shippingStore",
          header: "Kho VC",
          cell: ({ getValue }) => {
            const shippingStore = getValue() as ShippingStore;
            return (
              <div className="whitespace-nowrap">{shippingStore.name}</div>
            );
          },
        },
        {
          id: "status",
          accessorKey: "status",
          header: "Trạng thái",
          cell: ({ getValue, row }) => {
            const status = getValue() as OrderStatus;
            const id = row.original.id;

            return (
              <ComboBox
                disabled={role !== Role.ADMIN}
                value={status}
                options={orderStatusOptions}
                onValueChange={(value) =>
                  onStatusChange?.(id, value as OrderStatus)
                }
                triggerClassName="p-0"
                searchable={false}
                renderOption={(option) => {
                  const props =
                    orderStatusObject[option.value as OrderStatus] ?? {};
                  return renderBadge(props.color, option.label);
                }}
              />
            );
          },
        },
        {
          accessorKey: "actions",
          id: "actions",
          header: "",
          fixed: true,
          cell: ({ row }) => {
            const data = row.original;
            return (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEditClick?.(data)}
                >
                  <Edit />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDeleteClick?.(data)}
                >
                  <Trash className="text-red-500" />
                </Button>
              </div>
            );
          },
        },
      ] as EnhancedColumnDef<OrderWithExtra>[],
    [onStatusChange, onEditClick, onDeleteClick, role]
  );

  const filteredColumns = useMemo(
    () =>
      columns.filter((column) => {
        let finalExclude = [...(excludeColumns ?? [])];
        if (role === Role.USER)
          finalExclude = [
            ...finalExclude,
            "shippingFee",
            "secondShippingFee",
            "orderNumber",
            "deliveryCode",
            "checkBox",
            "source",
            "shippingStore",
            "actions",
          ];
        return !finalExclude?.includes(column.id as string);
      }),
    [columns, excludeColumns, role]
  );

  return filteredColumns;
};
