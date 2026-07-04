import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import { cn, formatAmount } from "@/lib/utils";
import {
  apiAddTransactionBalance,
  apiGetTransactionBalanceByDate,
} from "@/services/main/transactionBalanceServices";
import { BalanceNatureType } from "@/types/enum/app-enum";
import { TransactionBalanceItem } from "@/types/model/app-model";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import TransactionBalanceTable from "./TransactionBalanceTable";
import { v4 } from "uuid";

const defaultTransactionBalance = [
  { id: v4(), name: "PPVN", amount: 0, rate: 0, nature: BalanceNatureType.IN },
  { id: v4(), name: "PPUS", amount: 0, rate: 0, nature: BalanceNatureType.IN },
  {
    id: v4(),
    name: "ALI-156",
    amount: 0,
    rate: 0,
    nature: BalanceNatureType.IN,
  },
  {
    id: v4(),
    name: "ALI-836",
    amount: 0,
    rate: 0,
    nature: BalanceNatureType.IN,
  },
  {
    id: v4(),
    name: "Pending",
    amount: 0,
    rate: 0,
    nature: BalanceNatureType.IN,
  },
];

const TransactionBalancePage = () => {
  const [date, setDate] = React.useState<Date>(new Date());

  const { triggerLoading } = useTriggerLoading();

  const [isEdit, setIsEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<TransactionBalanceItem[]>(
    defaultTransactionBalance
  );

  const totalSelectedValues = useMemo(() => {
    return data
      .filter((item) => item.nature !== BalanceNatureType.PENDING)
      .reduce((acc, item) => {
        return acc + (item.amount ?? 0) * (item.rate ?? 0);
      }, 0);
  }, [data]);

  const onApply = () => {
    triggerLoading(async () => {
      await apiAddTransactionBalance({
        dateTime: date,
        data: JSON.stringify(data),
      });

      setIsEdit(false);
    });
  };

  const onAdd = () => {
    setData((prev) => [
      ...prev,
      {
        id: v4(),
        name: "",
        amount: 0,
        rate: 0,
        nature: BalanceNatureType.IN,
      },
    ]);
  };

  const getTransactionBalance = async (date: Date) => {
    return await triggerLoading(async () => {
      const { data } = await apiGetTransactionBalanceByDate({
        dateTime: date,
      });
      if (!data.success) return false;
      const balanceData = data.data;

      if (!balanceData.data) {
        setData(defaultTransactionBalance);
      }
      const tableData: TransactionBalanceItem[] = JSON.parse(
        balanceData.data ?? "[]"
      );

      if (tableData.length === 0) {
        setData(defaultTransactionBalance);
      } else setData(tableData);

      return true;
    });
  };

  useEffect(() => {
    getTransactionBalance(date);
  }, []);

  const onMonthSelect = async (date: Date) => {
    const isSuccess = await getTransactionBalance(date);
    if (isSuccess) {
      setDate(date);
      setOpen(false);
    }
  };

  return (
    <div>
      <div>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
          Bảng Balance
        </h3>
      </div>

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số dư</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span
                className={cn(
                  totalSelectedValues < 0 ? "text-red-500" : "text-green-600"
                )}
              >
                {formatAmount(totalSelectedValues)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      {isEdit && (
        <Button className="mb-4" onClick={onAdd}>
          Thêm mục
        </Button>
      )}
      <TransactionBalanceTable data={data} setData={setData} isEdit={isEdit} />
      {!isEdit ? (
        <Button onClick={() => setIsEdit(true)}>Chỉnh sửa</Button>
      ) : (
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={async () => {
              await getTransactionBalance(date);
              setIsEdit(false);
            }}
          >
            Quay lại
          </Button>
          <Button onClick={onApply}>Áp dụng</Button>
        </div>
      )}
    </div>
  );
};

export default TransactionBalancePage;
