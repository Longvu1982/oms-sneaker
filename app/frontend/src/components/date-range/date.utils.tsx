import { format } from "date-fns";
import { DateRange } from "react-day-picker";

export const renderSelectedDateRange = (value: DateRange | undefined) => {
  if (!value) return <span className="text-[#ddd]">Chọn khoảng thời gian</span>;

  if (value.from && !value?.to)
    return `${format(value.from, "dd/MM/yyyy")} - nay`;

  if (!value.from && value.to)
    return `Trước - ${format(value.to, "dd/MM/yyyy")}`;

  return `${format(value.from as Date, "dd/MM/yyyy")} - ${format(
    value.to as Date,
    "dd/MM/yyyy"
  )}`;
};
