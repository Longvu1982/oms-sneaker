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
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";

interface UserPanelProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSubmit: (data: UserFormValues) => void;
}

const schema = z.object({
  fullName: z.string().min(1, "Tên người dùng không được để trống"),
  email: z.union([
    z.literal(''),
    z.string().email("Email sai định dạng"),
  ]),
  phone: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  role: z.enum(
    [
      Role.ADMIN,
      Role.USER,
      Role.STAFF,
    ],
    {
      errorMap: () => ({ message: "Loại TK không hợp lệ" }),
    }
  ),
  transferedAmount: z.number().min(0),
  willCreateAccount: z.boolean(),
}).refine(data => !data.willCreateAccount || data.username?.trim() !== "", { message: "Username là bắt buộc", path: ["username"] }).
  refine(data => !data.willCreateAccount || data.password?.trim() !== "", { message: "Mật khẩu là bắt buộc", path: ["password"] })

const UserPanel: FC<UserPanelProps> = ({ isOpen, setIsOpen, onSubmit }) => {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      role: Role.USER,
      transferedAmount: 0,
      willCreateAccount: false,
    },
  });

   const [searchParams] = useSearchParams()
    const fullNameParam = searchParams.get("fullName")
    const isOpenParam = searchParams.get("openPanel")

    useEffect(() => {
      if(isOpenParam === "true" && fullNameParam) {
        setIsOpen(true)
      }
      form.setValue("fullName", fullNameParam ?? "")
    },[fullNameParam, isOpenParam])

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
                  <Input type="number" placeholder="Nhập số tiền" {...field} />
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
