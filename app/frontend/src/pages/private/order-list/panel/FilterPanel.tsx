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
import { FC } from "react";
import { UseFormReturn } from "react-hook-form";

export type FilterFormValues = {
  searchText: string;
  users: Option[];
  sources: Option[];
  shippingStores: Option[];
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
}
const FilterPanel: FC<FilterPanelProps> = ({
  form,
  isOpenFilter,
  setIsOpenFilter,
  onSubmit,
  options: { userList, sourceList, shippingStoreList },
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
          className="space-y-6 p-4"
        >
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
        </form>
      </Form>
    </Panel>
  );
};

export default FilterPanel;
