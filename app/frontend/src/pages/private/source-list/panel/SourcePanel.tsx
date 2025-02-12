import { ColorPicker } from "@/components/color-picker/ColorPicker";
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
import { FC } from "react";
import { UseFormReturn } from "react-hook-form";

export type SourceFormValues = { name: string; color: string; id?: string };

interface SourcePanelProps {
  form: UseFormReturn<SourceFormValues, A, undefined>;
  panelState: {
    isOpen: boolean;
    type: "create" | "edit";
    data: SourceFormValues;
  };
  setIsOpen: (value: boolean) => void;
  onSubmit: (data: SourceFormValues) => void;
}

const SourcePanel: FC<SourcePanelProps> = ({
  form,
  panelState,
  setIsOpen,
  onSubmit,
}) => {
  return (
    <Panel
      formId="sourceForm"
      title={
        panelState.type === "create" ? "Tạo nguồn hàng mới" : "Chỉnh sửa nguồn"
      }
      description="Điền thông tin"
      open={panelState.isOpen}
      onOpenChange={setIsOpen}
    >
      <Form {...form}>
        <form
          id="sourceForm"
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
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Màu sắc</FormLabel>
                <FormControl>
                  <ColorPicker value={field.value} onChange={field.onChange} />
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

export default SourcePanel;
