import { EnhancedColumnDef } from "@/components/data-table/dataTable.utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderWithExtra } from "@/services/main/orderServices";
import { ShippingStore, Source } from "@/types/model/app-model";
import { MoreHorizontal } from "lucide-react";

export const columns: EnhancedColumnDef<OrderWithExtra>[] = [
  {
    accessorKey: "orderDate",
    header: "Ngày order",
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
    header: "giá",
  },
  {
    accessorKey: "user",
    header: "Tên khách",
    cell: ({ row }) => {
      const { user } = row.original;
      return <div className="min-w-[120px]">{user.fullName}</div>;
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
      return (
        <div>
          {deliveryCode} : {deliveryCodeStatus}
        </div>
      );
    },
  },
  {
    accessorKey: "checkBox",
    header: "Hộp kiểm",
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
  },
  // {
  //   accessorKey: "email",
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="ghost"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //       >
  //         Email
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "amount",
  //   header: () => <div className="text-right">Amount</div>,
  //   cell: ({ row }) => {
  //     const amount = parseFloat(row.getValue("amount"));
  //     const formatted = new Intl.NumberFormat("en-US", {
  //       style: "currency",
  //       currency: "USD",
  //     }).format(amount);

  //     return <div className="text-right font-medium">{formatted}</div>;
  //   },
  // },
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
