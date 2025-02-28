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
import useAuthStore from "@/store/auth";
import { OrderStatus, Role } from "@/types/enum/app-enum";
import { FC } from "react";
import { DateRange } from "react-day-picker";
import { UseFormReturn } from "react-hook-form";

export type FilterFormValues = {
  searchText: string;
  users: Option[];
  sources: Option[];
  shippingStores: Option[];
  statuses: Option[];
  orderDate: DateRange | null;
  statusChangeDate: DateRange | null;
};

interface FilterPanelProps {
  form: UseFormReturn<FilterFormValues, A, undefined>;
  isOpenFilter: boolean;
  setIsOpenFilter: (value: boolean) => void;
  onSubmit: (data: FilterFormValues) => void;
  options: {
    userList: Option[];
    sourceList: Option[];
    shippingStoreList: Option[];
  };
  isCompletedStatus?: boolean;
  orderStatuses: OrderStatus[];
}
const FilterPanel: FC<FilterPanelProps> = ({
  form,
  isOpenFilter,
  setIsOpenFilter,
  onSubmit,
  options: { userList, sourceList, shippingStoreList },
}) => {
  const role = useAuthStore((s) => s.user?.account.role);
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
          <DateRangeForm form={form} label="Ngày order" name="orderDate" />

          <DateRangeForm
            form={form}
            label="Ngày chuyển trạng thái"
            name="statusChangeDate"
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
          {role !== Role.USER && (
            <>
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
                name="sources"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nguồn hàng</FormLabel>
                    <FormControl>
                      <MultipleSelector
                        placeholder="Chọn nguồn"
                        options={sourceList}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shippingStores"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kho vận chuyển</FormLabel>
                    <FormControl>
                      <MultipleSelector
                        placeholder="Chọn kho VC"
                        options={shippingStoreList}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </>
          )}
          {/* <FormField
            control={form.control}
            name="statuses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng thái đơn hàng</FormLabel>
                <FormControl>
                  <MultipleSelector
                    placeholder="Chọn trạng thái"
                    options={orderStatusOptions.filter((item) =>
                      orderStatuses.includes(item.value)
                    )}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          /> */}
        </form>
      </Form>
    </Panel>
  );
};

export default FilterPanel;
