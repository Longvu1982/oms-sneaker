import DateRangeForm from "@/components/date-range/DateRangeForm";
import MultipleSelector, {
  Option,
} from "@/components/multi-select/MutipleSelect";
import Panel from "@/components/panel/Panel";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  natureTypeOptions,
  transactionTypeOptions,
} from "@/types/model/app-model";
import { FC } from "react";
import { DateRange } from "react-day-picker";
import { UseFormReturn } from "react-hook-form";

export type FilterFormValues = {
  searchText: string;
  users: Option[];
  types: Option[];
  natures: Option[];
  transactionDate: DateRange | null;
};

export const countActiveFilters = (values: FilterFormValues): number => {
  let count = 0;
  if (values.searchText) count++;
  if (values.users?.length) count++;
  if (values.types?.length) count++;
  if (values.natures?.length) count++;
  if (values.transactionDate?.from || values.transactionDate?.to) count++;
  return count;
};

interface FilterPanelProps {
  form: UseFormReturn<FilterFormValues, A, undefined>;
  isOpenFilter: boolean;
  setIsOpenFilter: (value: boolean) => void;
  onSubmit: (data: FilterFormValues) => void;
  options: {
    userList: Option[];
  };
}
const FilterPanel: FC<FilterPanelProps> = ({
  form,
  isOpenFilter,
  setIsOpenFilter,
  onSubmit,
  options: { userList },
}) => {
  return (
    <Panel
      formId="filterForm"
      title="Bộ lọc"
      description="Chọn các bộ lọc để tìm kiếm nhanh hơn"
      open={isOpenFilter}
      onOpenChange={setIsOpenFilter}
    >
      <Form {...form}>
        <form
          id="filterForm"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 p-4"
        >
          <DateRangeForm
            form={form}
            label="Ngày giao dịch"
            name="transactionDate"
          />

          <FormField
            control={form.control}
            name="searchText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tìm kiếm</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập từ khoá" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="users"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Người dùng</FormLabel>
                <FormControl>
                  <MultipleSelector
                    placeholder="Chọn người dùng"
                    options={userList}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="types"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại giao dịch</FormLabel>
                <FormControl>
                  <MultipleSelector
                    placeholder="Chọn loại GD"
                    options={transactionTypeOptions}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="natures"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tính chất</FormLabel>
                <FormControl>
                  <MultipleSelector
                    placeholder="Chọn tính chất"
                    options={natureTypeOptions}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Panel>
  );
};

export default FilterPanel;
