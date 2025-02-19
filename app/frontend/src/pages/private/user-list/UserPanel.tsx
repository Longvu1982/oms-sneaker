import ComboBoxForm from "@/components/combo-box/ComboBoxForm";
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
import { Role } from "@/types/enum/app-enum";
import { roleStatusOptions } from "@/types/model/app-model";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { FC, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

interface UserPanelProps {
  panelState: {
    isOpen: boolean;
    type: "create" | "edit";
  };
  setIsOpen: (value: boolean) => void;
  onSubmit: (data: UserFormValues) => void;
  form: UseFormReturn<UserFormValues, A, undefined>;
  hasAccount: boolean;
}

const UserPanel: FC<UserPanelProps> = ({
  panelState,
  setIsOpen,
  onSubmit,
  form,
  hasAccount,
}) => {
  const [searchParams] = useSearchParams();
  const fullNameParam = searchParams.get("fullName");
  const isOpenParam = searchParams.get("openPanel");

  useEffect(() => {
    if (isOpenParam === "true" && fullNameParam) {
      setIsOpen(true);
    }
    form.setValue("fullName", fullNameParam ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullNameParam, isOpenParam]);

  const willCreateAccount = form.watch("willCreateAccount");

  useEffect(() => {
    if (willCreateAccount === false) {
      form.setValue("username", "");
      form.setValue("password", "");
      form.setValue("role", Role.USER);
    }
  }, [willCreateAccount, form]);

  return (
    <Panel
      formId="userForm"
      title={panelState.type === "create" ? "Tạo user mới" : "Chỉnh sửa user"}
      description="Điền thông tin"
      open={panelState.isOpen}
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
          {panelState.type === "create" && (
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="border-b-[1px]" />

          <div className="flex items-center gap-2 text-sm italic">
            {hasAccount ? (
              <>
                <CheckCircle size={16} className="text-green-600" /> Đã có tài
                khoản
              </>
            ) : (
              <>
                {" "}
                <AlertTriangle size={16} className="text-yellow-600" /> Chưa có
                tài khoản
              </>
            )}
          </div>
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
                    {hasAccount ? "Chỉnh sửa tài khoản" : "Tạo tài khoản"}
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
              <ComboBoxForm
                name="role"
                form={form}
                searchable={false}
                label="Loại tài khoản"
                options={roleStatusOptions}
              />
            </>
          )}
        </form>
      </Form>
    </Panel>
  );
};

export default UserPanel;
