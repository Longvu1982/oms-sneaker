import { NatureType, TransactionType } from "@/types/enum/app-enum";
import { z } from "zod";

export const schema = z.object({
  id: z.string().optional(),
  transactionDate: z.date({ message: "Ngày đặt hàng không hợp lệ." }),
  amount: z
    .number({ message: "Số tiền không hợp lệ." })
    .min(0, "Tiền phải lớn hơn hoặc bằng 0."),
  rate: z
    .number({ message: "Tỉ giá không hợp lệ." })
    .min(0, "Tỉ giá phải lớn hơn hoặc bằng 0."),
  type: z.enum(
    [
      TransactionType.BUY_CN,
      TransactionType.BUY_PP,
      TransactionType.CANCELLED,
      TransactionType.SELL_CN,
    ],
    {
      errorMap: () => ({ message: "Loại GD không hợp lệ." }),
    }
  ),
  nature: z.enum([NatureType.IN, NatureType.OUT], {
    errorMap: () => ({ message: "Tính chất không hợp lệ." }),
  }),
  userId: z.string().optional(),
  description: z.string().optional(),
});
