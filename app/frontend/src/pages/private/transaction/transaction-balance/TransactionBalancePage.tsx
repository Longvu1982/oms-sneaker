import { Button } from "@/components/ui/button";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import { cn } from "@/lib/utils";
import {
  apiAddTransactionBalance,
  apiGetTransactionBalanceByDate,
} from "@/services/main/transactionBalanceServices";
import { TransactionBalanceItem } from "@/types/model/app-model";
import { addDays, format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import TransactionBalanceTable from "./TransactionBalanceTable";

const defaultTransactionBalance = [
  { id: "1", name: "PPVN", amount: 0, rate: 0 },
  { id: "2", name: "PPUS", amount: 0, rate: 0 },
  { id: "3", name: "ALI-156", amount: 0, rate: 0 },
  { id: "4", name: "ALI-836", amount: 0, rate: 0 },
];

const TransactionBalancePage = () => {
  const [date, setDate] = React.useState<Date>(new Date());

  const { triggerLoading } = useTriggerLoading();

  const [isEdit, setIsEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<TransactionBalanceItem[]>(
    defaultTransactionBalance
  );

  const onApply = () => {
    triggerLoading(async () => {
      await apiAddTransactionBalance({
        dateTime: date,
        data: JSON.stringify(data),
      });

      setIsEdit(false);
    });
  };

  const getTransactionBalance = async (date: Date) => {
    return await triggerLoading(async () => {
      const { data } = await apiGetTransactionBalanceByDate({
        dateTime: addDays(date, 1),
      });
      if (!data.success) return false;
      const balanceData = data.data;

      if (!balanceData.data) {
        setData(defaultTransactionBalance);
      }
      const tableData: TransactionBalanceItem[] = JSON.parse(
        balanceData.data ?? "[]"
      );

      setData((prev) =>
        prev.map((item) => ({
          ...item,
          amount: tableData.find((t) => t.name === item.name)?.amount ?? 0,
          rate: tableData.find((t) => t.name === item.name)?.rate ?? 0,
        }))
      );

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

      <TransactionBalanceTable data={data} setData={setData} isEdit={isEdit} />
      {!isEdit ? (
        // <Sticky stickyClassName="bottom-0">
        <Button onClick={() => setIsEdit(true)}>Chỉnh sửa</Button>
      ) : (
        // </Sticky>
        // <Sticky stickyClassName="bottom-0" wrapperClassName="space-x-2">
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
        // </Sticky>
      )}
    </div>
  );
};

export default TransactionBalancePage;
