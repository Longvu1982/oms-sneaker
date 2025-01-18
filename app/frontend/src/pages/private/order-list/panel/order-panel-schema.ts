import { DeliveryCodeStatus, OrderStatus } from "@/types/enum/app-enum";
import { z } from "zod";

export const schema = z.object({
  id: z.string().optional(),
  SKU: z.string().nonempty("SKU không được để trống."),
  checkBox: z.boolean(),
  deliveryCode: z.string().optional(),
  deliveryCodeStatus: z.enum(
    [
      DeliveryCodeStatus.PENDING,
      DeliveryCodeStatus.EXIST,
      DeliveryCodeStatus.DELIVERD,
    ],
    {
      errorMap: () => ({ message: "Trạng thái mã giao hàng không hợp lệ." }),
    }
  ),
  deposit: z
    .number({ message: "Số tiền không hợp lệ." })
    .min(0, "Tiền đặt cọc phải lớn hơn hoặc bằng 0."),
  orderNumber: z.string().nonempty("Số đơn hàng không được để trống."),
  shippingFee: z
    .number({ message: "Số tiền không hợp lệ." })
    .min(0, "Phí vận chuyển phải lớn hơn hoặc bằng 0."),
  secondShippingFee: z
    .number({ message: "Số tiền không hợp lệ." })
    .min(0, "Phí vận chuyển phải lớn hơn hoặc bằng 0."),
  shippingStoreId: z
    .string()
    .nonempty("Kho không được để trống.")
    .uuid("ID cửa hàng vận chuyển phải là UUID hợp lệ."),
  size: z.number().positive("Kích thước phải lớn hơn 0."),
  sourceId: z
    .string()
    .nonempty("Nguồn được để trống.")
    .uuid("ID nguồn phải là UUID hợp lệ."),
  status: z.enum(
    [
      OrderStatus.ONGOING,
      OrderStatus.LANDED,
      OrderStatus.SHIPPED,
      OrderStatus.CANCELLED,
    ],
    {
      errorMap: () => ({ message: "Trạng thái không hợp lệ." }),
    }
  ),
  totalPrice: z
    .number({ message: "Số tiền không hợp lệ." })
    .min(0, "Tổng giá phải lớn hơn hoặc bằng 0."),
  userId: z
    .string()
    .nonempty("KH không được để trống.")
    .uuid("ID người dùng phải là UUID hợp lệ."),
});
