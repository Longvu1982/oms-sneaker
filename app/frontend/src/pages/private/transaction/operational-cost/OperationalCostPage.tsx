import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import { cn, formatAmount } from "@/lib/utils";
import {
  apiAddOperationalCost,
  apiGetOperationalCostByDate,
} from "@/services/main/operationalCostServices";
import { OperationalCost } from "@/types/model/app-model";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

const OperationalCostPage = () => {
  const [date, setDate] = useState<Date>(new Date());

  const { triggerLoading } = useTriggerLoading();

  const [isEdit, setIsEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<OperationalCost>({} as OperationalCost);

  const onApply = () => {
    triggerLoading(async () => {
      await apiAddOperationalCost({
        dateTime: date,
        amount: data?.amount ?? 0,
      });

      setIsEdit(false);
    });
  };

  const getCost = async (date: Date) => {
    return await triggerLoading(async () => {
      const { data } = await apiGetOperationalCostByDate({ dateTime: date });
      console.log(data);
      if (!data.success || !data.data) {
        setData({} as OperationalCost);
        return false;
      }

      setData(data.data);
      return true;
    });
  };

  const onMonthSelect = async (date: Date) => {
    const isSuccess = await getCost(date);
    if (isSuccess) {
      setDate(date);
      setOpen(false);
    }
  };

  useEffect(() => {
    getCost(date);
  }, []);

  return (
    <div>
      <div>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
          Chi phí vận hành
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
            <CardTitle className="text-sm font-medium">
              Chi phí tháng {date.getMonth() + 1}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={cn("text-red-500")}>
                -{formatAmount(data.amount ?? 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {isEdit && (
        <>
          <Label className="mb-4 block">
            Chi phí vận hành trong tháng {date.getMonth() + 1}
          </Label>
          <Input
            type="number"
            wrapperClassname="w-[400px] mb-6"
            placeholder="Nhập tiền cọc"
            renderExtra={formatAmount}
            value={data?.amount ?? 0}
            readOnly={!isEdit}
            onChange={(value) => {
              setData({
                ...data,
                amount: Number(value as unknown as number),
              });
            }}
          />
        </>
      )}

      {!isEdit ? (
        <Button onClick={() => setIsEdit(true)}>Chỉnh sửa</Button>
      ) : (
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={async () => {
              await getCost(date);
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

export default OperationalCostPage;
