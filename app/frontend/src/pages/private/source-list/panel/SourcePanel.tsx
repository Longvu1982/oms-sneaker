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

export type SourceFormValues = { name: string };

interface SourcePanelProps {
  form: UseFormReturn<SourceFormValues, A, undefined>;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSubmit: (data: SourceFormValues) => void;
}

const SourcePanel: FC<SourcePanelProps> = ({
  form,
  isOpen,
  setIsOpen,
  onSubmit,
}) => {
  return (
    <Panel
      formId="sourceForm"
      title="Tạo nguồn hàng mới"
      description="Điền thông tin để tạo nguồn hàng"
      open={isOpen}
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
        </form>
      </Form>
    </Panel>
  );
};

export default SourcePanel;
