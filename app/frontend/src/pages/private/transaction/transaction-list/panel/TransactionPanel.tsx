import ComboBoxForm from "@/components/combo-box/ComboBoxForm";
import { Option } from "@/components/multi-select/MutipleSelect";
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
import { formatAmount, renderBadge } from "@/lib/utils";
import { NatureType, TransactionType } from "@/types/enum/app-enum";
import {
  natureTypeOptions,
  Transaction,
  transactionTypeOptions,
} from "@/types/model/app-model";
import { FC } from "react";
import { UseFormReturn } from "react-hook-form";
import { natureObject, transactionTypeObject } from "../transaction-utils";

export type TransactionFormValues = Omit<
  Transaction,
  "id" | "createdAt" | "updatedAt"
>;

interface TransactionPanelProps {
  form: UseFormReturn<TransactionFormValues, A, undefined>;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSubmit: (data: TransactionFormValues) => void;
  options: {
    userList: Option[];
  };
}

const TransactionPanel: FC<TransactionPanelProps> = ({
  form,
  isOpen,
  setIsOpen,
  onSubmit,
  options: { userList },
}) => {
  return (
    <Panel
      formId="transactionForm"
      title="Tạo giao dịch mới"
      description="Điền thông tin để tạo giao dịch"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <Form {...form}>
        <form
          id="transactionForm"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 p-4"
        >
          <ComboBoxForm
            name="nature"
            form={form}
            searchable={false}
            label="Tính chất"
            options={natureTypeOptions}
            renderOption={(option) => {
              const props = natureObject[option.value as NatureType] ?? {};
              return renderBadge(props.color, option.label);
            }}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số lượng</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Nhập số lượng" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tỉ giá</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Nhập tỉ giá"
                    {...field}
                    renderExtra={formatAmount}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ComboBoxForm
            name="type"
            form={form}
            searchable={false}
            label="Loại GD"
            options={transactionTypeOptions}
            renderOption={(option) => {
              const props =
                transactionTypeObject[option.value as TransactionType] ?? {};
              return renderBadge(props.color, option.label);
            }}
          />

          <ComboBoxForm
            name="userId"
            form={form}
            label="Khách hàng"
            options={userList}
          />
        </form>
      </Form>
    </Panel>
  );
};

export default TransactionPanel;
