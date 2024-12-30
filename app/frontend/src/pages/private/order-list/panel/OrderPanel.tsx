import ComboBoxForm from "@/components/combo-box/ComboBoxForm";
import { Option } from "@/components/multi-select/MutipleSelect";
import Panel from "@/components/panel/Panel";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DeliveryCodeStatus, OrderStatus } from "@/types/enum/app-enum";
import {
  deliveryCodeStatusOptions,
  Order,
  orderStatusOptions,
} from "@/types/model/app-model";
import { FC, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  deliveryCodeStatusObject,
  orderStatusObject,
  renderBadge,
} from "../order-list-utils";

export type OrderFormValues = Omit<Order, "id" | "createdAt" | "updatedAt">;

interface OrderPanelProps {
  form: UseFormReturn<OrderFormValues, A, undefined>;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSubmit: (data: OrderFormValues) => void;
  options: {
    userList: Option[];
    sourceList: Option[];
    shippingStoreList: Option[];
  };
}

const OrderPanel: FC<OrderPanelProps> = ({
  form,
  isOpen,
  setIsOpen,
  onSubmit,
  options: { userList, sourceList, shippingStoreList },
}) => {
  const [watchDeliveryCode, setWatchDeliveryCode] = useState("");

  return (
    <Panel
      formId="orderForm"
      title="Tạo đơn hàng mới"
      description="Điền thông tin để tạo đơn hàng"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <Form {...form}>
        <form
          id="orderForm"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 p-4"
        >
          <FormField
            control={form.control}
            name="checkBox"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hộp kiểm</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      id="checkBox"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        form.setValue("checkBox", checked as boolean)
                      }
                    />
                  </FormControl>
                  <label
                    htmlFor="checkBox"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {field.value ? "Đã có" : "Chưa có"}
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="SKU"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập SKU" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Nhập size"
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deposit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiền cọc</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Nhập tiền cọc"
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá tiền</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Nhập giá trị đơn hàng"
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shippingFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cước vận chuyển</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Nhập cước"
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="orderNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order number</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập mã" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deliveryCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã vận đơn</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập mã"
                    {...field}
                    onChange={(e) => {
                      form.setValue(
                        "deliveryCodeStatus",
                        e.target.value?.trim()
                          ? DeliveryCodeStatus.EXIST
                          : DeliveryCodeStatus.PENDING
                      );
                      field.onChange(e);
                      setWatchDeliveryCode(e.target.value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <ComboBoxForm
            name="deliveryCodeStatus"
            form={form}
            searchable={false}
            label="Trạng thái MVĐ"
            options={deliveryCodeStatusOptions.map((option) => {
              const disableNoCode =
                !watchDeliveryCode &&
                [
                  DeliveryCodeStatus.DELIVERD,
                  DeliveryCodeStatus.EXIST,
                ].includes(option.value);

              const disableWithCode =
                watchDeliveryCode &&
                option.value === DeliveryCodeStatus.PENDING;

              return {
                ...option,
                disable: Boolean(disableNoCode || disableWithCode),
              };
            })}
            renderOption={(option) => {
              const props =
                deliveryCodeStatusObject[option.value as DeliveryCodeStatus] ??
                {};
              return renderBadge(props.color, option.label);
            }}
          />

          <ComboBoxForm
            name="status"
            form={form}
            searchable={false}
            label="Trạng thái đơn hàng"
            options={orderStatusOptions}
            renderOption={(option) => {
              const props =
                orderStatusObject[option.value as OrderStatus] ?? {};
              return renderBadge(props.color, option.label);
            }}
          />

          <ComboBoxForm
            name="userId"
            form={form}
            label="Khách hàng"
            options={userList}
          />
          <ComboBoxForm
            name="sourceId"
            form={form}
            label="Nguồn"
            options={sourceList}
          />
          <ComboBoxForm
            name="shippingStoreId"
            form={form}
            label="Kho vận chuyển"
            options={shippingStoreList}
          />
        </form>
      </Form>
    </Panel>
  );
};

export default OrderPanel;