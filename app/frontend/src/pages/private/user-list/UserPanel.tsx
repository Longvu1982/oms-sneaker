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
import { UserFormValues } from "@/services/main/userServices";
import { FC, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

interface UserPanelProps {
  form: UseFormReturn<UserFormValues, A, undefined>;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSubmit: (data: UserFormValues) => void;
}

const UserPanel: FC<UserPanelProps> = ({
  form,
  isOpen,
  setIsOpen,
  onSubmit,
}) => {
  const willCreateAccount = form.watch("willCreateAccount");

  useEffect(() => {
    if (willCreateAccount === false) {
      form.setValue("username", "");
      form.setValue("password", "");
    }
  }, [willCreateAccount, form]);

  return (
    <Panel
      formId="userForm"
      title="Tạo user mới"
      description="Điền thông tin để tạo user"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <Form {...form}>
        <form
          id="userForm"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 p-4"
        >
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên khách hàng" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ email</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập email" {...field} />
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
          <FormField
            control={form.control}
            name="transferedAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số tiền đã chuyển</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Nhập số tiền"
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

          <div className="border-b-[1px]" />

          <FormField
            control={form.control}
            name="willCreateAccount"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      id="checkBox"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        form.setValue("willCreateAccount", checked as boolean)
                      }
                    />
                  </FormControl>
                  <label
                    htmlFor="checkBox"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Tạo tài khoản?
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {willCreateAccount && (
            <>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập mật khẩu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </form>
      </Form>
    </Panel>
  );
};

export default UserPanel;
