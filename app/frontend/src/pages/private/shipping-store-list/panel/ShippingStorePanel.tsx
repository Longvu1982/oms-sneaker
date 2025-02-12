import Panel from "@/components/panel/Panel";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ShippingStoreFormValues } from "@/services/main/shippingStoreServices";
import { FC } from "react";
import { UseFormReturn } from "react-hook-form";

interface ShippingStorePanelProps {
  form: UseFormReturn<ShippingStoreFormValues, A, undefined>;
  panelState: {
    isOpen: boolean;
    type: "create" | "edit";
  };
  setIsOpen: (value: boolean) => void;
  onSubmit: (data: ShippingStoreFormValues) => void;
}

const ShippingStorePanel: FC<ShippingStorePanelProps> = ({
  form,
  panelState,
  setIsOpen,
  onSubmit,
}) => {
  return (
    <Panel
      formId="shippingStoreForm"
      title={
        panelState.type === "create"
          ? "Tạo kho vận chuyển mới"
          : "Chỉnh sửa thông tin"
      }
      description="Điền thông tin"
      open={panelState.isOpen}
      onOpenChange={setIsOpen}
    >
      <Form {...form}>
        <form
          id="shippingStoreForm"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 p-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên kho" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập địa chỉ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập số điện thoại" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Panel>
  );
};

export default ShippingStorePanel;
