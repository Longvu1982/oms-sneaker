import { Badge } from "@/components/ui/badge";
import { clsx, type ClassValue } from "clsx";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const renderBadge = (color: string, text: ReactNode) => (
  <Badge
    className="whitespace-nowrap py-1 dard:text-black"
    variant="outline"
    style={{
      background: color,
    }}
  >
    <div className="dark:text-black">{text}</div>
  </Badge>
);

export const formatAmount: (input: number | string) => string = (input) => {
  const amount = parseFloat(input as string);
  if (isNaN(amount)) return "";

  const amountInVND = amount * 1000;

  return amountInVND.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

export const createURL = (
  baseUrl: string,
  queryObj?: Record<string, string | number | undefined | null>
) => {
  let queryString = "";
  if (queryObj)
    queryString = Object.entries(queryObj)
      .filter(([, value]) => value != null)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value as A)}`
      )
      .join("&");

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};
