import { DataTable } from "@/components/data-table/DataTable";
import { EnhancedColumnDef } from "@/components/data-table/dataTable.utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatAmount } from "@/lib/utils";
import { Order, Transfered } from "@/types/model/app-model";
import { useMemo } from "react";

interface DailyBalanceTableProps {
  dailyBalances: {
    date: string;
    orders: Order[];
    transfers: Transfered[];
  }[];
}

interface TableData {
  id: string;
  date: string;
  totalOrderAmount: number;
  totalTransferAmount: number;
  dailyBalance: number;
}

const columns: EnhancedColumnDef<TableData>[] = [
  {
    accessorKey: "date",
    header: "Ngày",
  },
  {
    accessorKey: "totalOrderAmount",
    header: "Đơn hàng",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <span className={cn("font-medium", "text-red-500")}>
          {formatAmount(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "totalTransferAmount",
    header: "Nạp tiền",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <span
          className={cn(
            "font-medium",
            value < 0 ? "text-red-500" : "text-green-600"
          )}
        >
          {formatAmount(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "dailyBalance",
    header: "Số dư",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <span
          className={cn(
            "font-medium",
            value < 0 ? "text-red-500" : "text-green-600"
          )}
        >
          {formatAmount(value)}
        </span>
      );
    },
  },
];

const getDailyBalance = (balance: {
  orders: Order[];
  transfers: Transfered[];
}) => {
  const totalOrderAmount = balance.orders.reduce((sum, order) => {
    return sum + (order.totalPrice - order.deposit + order.shippingFee);
  }, 0);

  const totalTransferAmount = balance.transfers.reduce((sum, transfer) => {
    return sum + transfer.amount;
  }, 0);

  return {
    dailyBalance: totalTransferAmount - totalOrderAmount,
    totalOrderAmount,
    totalTransferAmount,
  };
};

const DailyBalanceTable = ({ dailyBalances }: DailyBalanceTableProps) => {
  const tableData: TableData[] = useMemo(() => {
    const result: TableData[] = [];
    let memorizedProps: TableData | null = null;

    // LOGIC TO ACCUMULATE DAILY BALANCE
    for (let i = dailyBalances.length - 1; i >= 0; i--) {
      if (i === dailyBalances.length - 1) {
        // last element
        const props = getDailyBalance(dailyBalances[i]);
        const data = {
          id: dailyBalances[i].date,
          date: dailyBalances[i].date,
          totalOrderAmount: props.totalOrderAmount,
          totalTransferAmount: props.totalTransferAmount,
          dailyBalance: props.dailyBalance,
        };
        result[i] = { ...data };
        memorizedProps = { ...data };
        continue;
      }

      const props = getDailyBalance(dailyBalances[i]);
      const data: TableData = {
        id: dailyBalances[i].date,
        date: dailyBalances[i].date,
        totalOrderAmount: props.totalOrderAmount,
        totalTransferAmount: props.totalTransferAmount,
        dailyBalance: props.dailyBalance + (memorizedProps?.dailyBalance ?? 0),
      };
      result[i] = { ...data };
      memorizedProps = { ...data };
    }

    return result;
  }, [dailyBalances]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Số dư theo ngày</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={tableData}
          manualPagination={false}
          showPagination={true}
        />
      </CardContent>
    </Card>
  );
};

export default DailyBalanceTable;
