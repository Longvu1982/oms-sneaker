import ComboBox from "@/components/combo-box/ComboBox";
import { EnhancedColumnDef } from "@/components/data-table/dataTable.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderWithExtra } from "@/services/main/orderServices";
import { OrderStatus } from "@/types/enum/app-enum";
import {
  orderStatusOptions,
  ShippingStore,
  Source,
} from "@/types/model/app-model";
import { format } from "date-fns/format";
import { MoreHorizontal } from "lucide-react";
import {
  deliveryCodeStatusObject,
  orderStatusObject,
  renderBadge,
} from "./order-list-utils";

type getOrdercolumnsProps = {
  onStatusChange: (id: string, status: OrderStatus) => Promise<A>;
};

export const getOrdercolumns: ({
  onStatusChange,
}: getOrdercolumnsProps) => EnhancedColumnDef<OrderWithExtra>[] = ({
  onStatusChange,
}) => [
  {
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
    accessorKey: "statusChangeDate",
    header: "Ngày chuyển trạng thái",
    cell: ({ getValue }) => {
      return (
        <div className="whitespace-nowrap min-w-[120px]">
          {getValue() ? format(getValue() as string, "dd/MM/yyyy") : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "SKU",
    header: "SKU",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "deposit",
    header: "Cọc",
  },
  {
    accessorKey: "totalPrice",
    header: "Giá",
  },
  {
    accessorKey: "user",
    header: "Tên khách",
    cell: ({ row }) => {
      const { user } = row.original;
      return <div className="whitespace-nowrap">{user.fullName}</div>;
    },
  },
  {
    accessorKey: "orderNumber",
    header: "Order number",
  },
  {
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
            background: deliveryCodeStatusObject[deliveryCodeStatus]?.color,
          }}
        >
          {codeText} : {deliveryCodeStatusObject[deliveryCodeStatus]?.text}
        </Badge>
      );
    },
  },
  {
    accessorKey: "checkBox",
    header: "Hộp kiểm",
    cell: ({ getValue }) => {
      const isChecked = getValue() as boolean;
      return isChecked ? <Checkbox checked /> : <></>;
    },
  },
  {
    accessorKey: "source",
    header: "Nguồn",
    cell: ({ getValue }) => {
      const source = getValue() as Source;
      return <div>{source.name}</div>;
    },
  },
  {
    accessorKey: "shippingFee",
    header: "Cước VC",
    cell: ({ getValue }) => {
      const shippingFee = getValue() as number;
      return <div>{shippingFee}K</div>;
    },
  },
  {
    accessorKey: "shippingStore",
    header: "Kho VC",
    cell: ({ getValue }) => {
      const shippingStore = getValue() as ShippingStore;
      return <div>{shippingStore.name}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ getValue, row }) => {
      const status = getValue() as OrderStatus;
      const id = row.original.id;

      return (
        <ComboBox
          value={status}
          options={orderStatusOptions}
          onValueChange={(value) => onStatusChange(id, value as OrderStatus)}
          triggerClassName="p-0"
          searchable={false}
          renderOption={(option) => {
            const props = orderStatusObject[option.value as OrderStatus] ?? {};
            return renderBadge(props.color, option.label);
          }}
        />
      );
    },
  },
  {
    id: "actions",
    fixed: true,
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="sticky right-0">
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
