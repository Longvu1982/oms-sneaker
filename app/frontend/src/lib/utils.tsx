import { Badge } from "@/components/ui/badge";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const renderBadge = (color: string, text: string) => (
  <Badge
    className="whitespace-nowrap py-1"
    variant="outline"
    style={{
      background: color,
    }}
  >
    {text}
  </Badge>
);

export const formatAmount: (amount: number) => string = (amount) => {
  if (isNaN(amount)) return "Invalid amount";

  const amountInVND = amount * 1000;

  return amountInVND.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};
