import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import { cn, formatAmount } from "@/lib/utils";
import { apiGetOperationalCostByDate } from "@/services/main/operationalCostServices";
import { apiGetOrderList, OrderWithExtra } from "@/services/main/orderServices";
import { apiGetTransactionBalanceByDate } from "@/services/main/transactionBalanceServices";
import { apiGetTransactionList } from "@/services/main/transactionServices";
import {
  BalanceNatureType,
  NatureType,
  OrderStatus,
} from "@/types/enum/app-enum";
import {
  initQueryParams,
  OperationalCostItem,
  QueryDataModel,
  TransactionBalanceItem,
  TransactionWithExtra,
} from "@/types/model/app-model";
import { addDays, endOfMonth, format, startOfMonth } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import OrderTable from "../order-list/table/OrderTable";
import OperationalCostTable from "../transaction/operational-cost/OperationalCostTable";
import TransactionBalanceTable from "../transaction/transaction-balance/TransactionBalanceTable";
import TransactionTable from "../transaction/transaction-list/table/TransactionTable";

type StatisticData = {
  revenue: number;
  profit: number;
  orderList: OrderWithExtra[];
  balanceTable: TransactionBalanceItem[];
  transactionList: TransactionWithExtra[];
  operationalCostData: OperationalCostItem[];
};

const defaultStatistics: StatisticData = {
  revenue: 0,
  profit: 0,
  orderList: [],
  balanceTable: [],
  transactionList: [],
  operationalCostData: [],
};

const StatisticPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [statisticData, setStatisticData] =
    useState<StatisticData>(defaultStatistics);
  const { triggerLoading } = useTriggerLoading();
  const [open, setOpen] = useState(false);

  const onMonthSelect = async (date: Date) => {
    const isSuccess = await getStatisticData(addDays(date, 1));
    if (isSuccess) {
      setDate(date);
      setOpen(false);
    }
  };

  const getStatisticData = async (date: Date) => {
    const from = startOfMonth(date);
    const to = endOfMonth(date);

    const paginationParams = { ...initQueryParams.pagination, pageSize: 0 };

    const orderQueryParams: QueryDataModel = {
      ...initQueryParams,
      pagination: paginationParams,
      filter: [
        {
          column: "status",
          value: [OrderStatus.SHIPPED, OrderStatus.ONGOING, OrderStatus.LANDED],
        },
        {
          column: "orderDate",
          value: { from, to },
        },
      ],
    };

    const transactionQueryParams: QueryDataModel = {
      ...initQueryParams,
      pagination: paginationParams,
      filter: [
        {
          column: "transactionDate",
          value: { from, to },
        },
      ],
    };

    return await triggerLoading(async () => {
      const [odderData, transactionData, balanceTableData, operationalCost] =
        await Promise.all([
          apiGetOrderList(orderQueryParams),
          apiGetTransactionList(transactionQueryParams),
          apiGetTransactionBalanceByDate({ dateTime: date }),
          apiGetOperationalCostByDate({ dateTime: date }),
        ]);

      const orderList = odderData.data.data.orders ?? [];
      const transactionList = transactionData.data.data.transactions ?? [];
      const balanceTable = JSON.parse(
        balanceTableData.data.data.data ?? "[]"
      ) as TransactionBalanceItem[];

      const operationalCostData = JSON.parse(
        operationalCost.data.data.data ?? "[]"
      ) as OperationalCostItem[];

      const { profit, revenue } = calculateBalance(
        orderList,
        transactionList,
        balanceTable,
        operationalCostData
      );

      setStatisticData({
        orderList,
        transactionList,
        balanceTable,
        operationalCostData,
        profit,
        revenue,
      });

      return true;
    });
  };

  useEffect(() => {
    getStatisticData(new Date());
  }, []);

  return (
    <div>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
        Quản lý doanh thu
      </h3>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal mb-6",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, "MM/yyyy", { locale: vi })
            ) : (
              <span>Chọn tháng</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <MonthPicker onMonthSelect={onMonthSelect} selectedMonth={date} />
        </PopoverContent>
      </Popover>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(statisticData.revenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lợi nhuận</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                statisticData.profit > 0 ? "text-green-500" : "text-red-500"
              )}
            >
              {formatAmount(statisticData.profit)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="order" className="mt-6">
        <TabsList>
          <TabsTrigger value="order">Đơn hàng</TabsTrigger>
          <TabsTrigger value="transaction">Ngoại tệ</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="cost">Phí vận hành</TabsTrigger>
        </TabsList>
        <TabsContent value="order">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Danh sách đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Số lượng: <strong>{statisticData.orderList?.length}</strong>
              </p>

              <OrderTable
                orderList={statisticData.orderList}
                manualPagination={false}
                excludeColumns={["actions"]}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transaction">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Danh sách giao dịch</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Số lượng:{" "}
                <strong>{statisticData.transactionList?.length}</strong>
              </p>

              <TransactionTable
                transactionList={statisticData.transactionList}
                manualPagination={false}
                excludeColumns={["actions"]}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="balance">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Bảng Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionBalanceTable
                data={statisticData.balanceTable}
                isEdit={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cost">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Chi phí tháng {date.getMonth() + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <OperationalCostTable
                data={statisticData.operationalCostData}
                isEdit={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatisticPage;

const calculateBalance = (
  orderList: OrderWithExtra[],
  transactionList: TransactionWithExtra[],
  balanceTable: TransactionBalanceItem[],
  operationalCostData: OperationalCostItem[]
) => {
  const balanceTableIn = balanceTable
    .filter(
      (item) =>
        item.amount && item.rate && item.nature !== BalanceNatureType.PENDING
    )
    .reduce(
      (acc, cur) => acc + (cur.amount as number) * (cur.rate as number),
      0
    );

  const operationalCostOut = operationalCostData
    .filter((item) => item.amount && item.nature === NatureType.OUT)
    .reduce((acc, cur) => acc + cur.amount, 0);

  const transactionListIn = transactionList
    .filter((item) => item.amount && item.rate)
    .reduce((acc, cur) => {
      if (cur.nature === NatureType.IN) acc += cur.amount * cur.rate;
      else acc -= cur.amount * cur.rate;
      return acc;
    }, 0);

  const orderIn = orderList.reduce((acc, cur) => acc + cur.totalPrice, 0);
  const orderOut = orderList.reduce(
    (acc, cur) => acc + cur.secondShippingFee,
    0
  );

  return {
    profit:
      balanceTableIn +
      transactionListIn +
      orderIn -
      orderOut -
      operationalCostOut,
    revenue: orderIn,
  };
};
