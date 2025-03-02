import { DeliveryCodeStatus, OrderStatus } from '@prisma/client';
import { z } from 'zod';

// _____________  User Schema  Login  _____________

const userBaseSchema = {
  username: z.string().min(1, { message: 'username must be at least 1 characters long' }).max(50, {
    message: 'username cannot be longer than 50 characters',
  }),
  password: z.string().min(1, { message: 'password must be at least 1 characters long' }).max(50, {
    message: 'password cannot be longer than 50 characters',
  }),
};

export const userSchema = z.object(userBaseSchema);

// _____________  User Update Schema   _____________

export const userUpdateSchema = z.object({
  ...userBaseSchema,
  fullName: z.string().min(1, { message: 'fullName must be at least 1 characters long' }).max(50, {
    message: 'fullName cannot be longer than 50 characters',
  }),
  email: z.string().email({ message: 'Invalid email address' }),
});

export const orderSchema = z.object({
  id: z.string().optional(),
  SKU: z.string().nonempty('SKU không được để trống.'),
  checkBox: z.boolean(),
  deliveryCode: z.string().optional(),
  deliveryCodeStatus: z.enum([DeliveryCodeStatus.PENDING, DeliveryCodeStatus.EXIST, DeliveryCodeStatus.DELIVERD], {
    errorMap: () => ({ message: 'Trạng thái mã giao hàng không hợp lệ.' }),
  }),
  deposit: z.number().min(0, 'Tiền đặt cọc phải lớn hơn hoặc bằng 0.'),
  orderNumber: z.string().nonempty('Số đơn hàng không được để trống.'),
  shippingFee: z.number().min(0, 'Phí vận chuyển phải lớn hơn hoặc bằng 0.'),
  secondShippingFee: z.number().min(0, 'Phí vận chuyển phải lớn hơn hoặc bằng 0.'),
  shippingStoreId: z.string().nonempty('Kho không được để trống.').uuid('ID cửa hàng vận chuyển phải là UUID hợp lệ.'),
  size: z.string().nonempty('Size không được để trống.'),
  sourceId: z.string().nonempty('Nguồn được để trống.').uuid('ID nguồn phải là UUID hợp lệ.'),
  status: z.enum([OrderStatus.ONGOING, OrderStatus.LANDED, OrderStatus.SHIPPED, OrderStatus.CANCELLED], {
    errorMap: () => ({ message: 'Trạng thái không hợp lệ.' }),
  }),
  totalPrice: z.number().min(0, 'Tổng giá phải lớn hơn hoặc bằng 0.'),
  userId: z.string().nonempty('KH không được để trống.').uuid('ID người dùng phải là UUID hợp lệ.'),
  orderDate: z.string({ message: 'Ngày đặt hàng không hợp lệ.' }),
});

// _____________  Export Types   _____________

export type TUserSchema = z.infer<typeof userSchema>;
export type TuserUpdateSchema = z.infer<typeof userUpdateSchema>;
