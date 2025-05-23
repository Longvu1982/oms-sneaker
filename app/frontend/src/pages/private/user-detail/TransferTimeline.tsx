import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatAmount } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import type React from "react";

interface Transfer {
  id: string;
  amount: number;
  createdAt: string;
}

interface TransfersTimelineProps {
  transfers: Transfer[];
  type: "full" | "group";
}

export const TransfersTimeline: React.FC<TransfersTimelineProps> = ({
  transfers,
  type,
}) => {
  const moneyTypeText = (amount: number) => {
    if (type === "full") return amount > 0 ? "Nạp tiền" : "Rút tiền";
    else if (type === "group") return amount > 0 ? "Dương" : "Âm";
  };

  return (
    <ScrollArea
      className={cn(
        "h-[400px] pr-4",
        transfers.length > 0 ? "h-[300px]" : "h-[100px]"
      )}
    >
      <div className="">
        {transfers.length === 0 && "Chưa có dữ liệu"}
        {transfers.map((transfer, index) => (
          <div key={transfer.id} className="flex items-start">
            <div className="flex flex-col items-center mr-4">
              <div
                className={`rounded-full p-2 ${
                  transfer.amount >= 0 ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {transfer.amount >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-white" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-white" />
                )}
              </div>
              {index !== transfers.length - 1 && (
                <div className="h-[20px] w-0.5 bg-gray-400 dark:bg-white opacity-35 my-1" />
              )}
            </div>
            <div>
              <p className="font-semibold">
                {moneyTypeText(transfer.amount)}:{" "}
                {formatAmount(Math.abs(transfer.amount))}
              </p>
              <p className="text-sm text-gray-500">{transfer.createdAt}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
