import { DataTable } from "@/components/data-table/DataTable";
import { EnhancedColumnDef } from "@/components/data-table/dataTable.utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import { cn, formatAmount } from "@/lib/utils";
import { apiAddTransfer } from "@/services/main/transferServices";
import {
  apiCreateUser,
  apiGetUsersListDetails,
  apiUpdateUser,
  UserFormValues,
} from "@/services/main/userServices";
import { Role } from "@/types/enum/app-enum";
import { initQueryParams, QueryDataModel, User } from "@/types/model/app-model";
import { zodResolver } from "@hookform/resolvers/zod";
import { setHours, setMilliseconds, setMinutes, setSeconds } from "date-fns";
import { Edit, MoreHorizontal, PlusCircle, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import {
  AddTransferModal,
  AddTransferModalFormValues,
} from "./modal/AddTransferModal";
import UserPanel from "./UserPanel";

const columns: EnhancedColumnDef<User>[] = [
  {
    id: "STT",
    header: "STT",
    cell: ({ row }) => {
      return <div>{row.index + 1}</div>;
    },
  },
  {
    accessorKey: "fullName",
    header: "Họ và tên",
    cell: ({ getValue, row, table }) => {
      const onClickFullname = table.options.meta?.onClickFullname;

      const userId = row.original.id;
      return (
        <Button
          variant="link"
          className="px-0 py-0 text-blue-500 h-5"
          onClick={() => onClickFullname?.(userId)}
        >
          <span className="whitespace-nowrap">{getValue() as string}</span>
        </Button>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "SĐT",
  },
  {
    accessorKey: "orderCount",
    header: "Số lượng đơn",
  },
  {
    accessorKey: "transfered",
    header: "Tiền đã chuyển",
    cell: ({ getValue }) => formatAmount(getValue() as number),
  },
  {
    accessorKey: "balance",
    header: "Số dư",
    cell: ({ getValue }) => (
      <span
        className={cn(
          (getValue() as number) < 0 ? "text-red-500" : "text-green-600"
        )}
      >
        {formatAmount(getValue() as number)}
      </span>
    ),
  },
  {
    id: "actions",
    fixed: true,
    cell: ({ row, table }) => {
      const onClickAddTransfer = table.options.meta?.onClickAddTransfer;
      const onClickEditUser = table.options.meta?.onClickEditUser;
      const user = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="sticky right-0">
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onClickAddTransfer?.(user)}
            >
              <PlusCircle />
              Nạp tiền
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onClickEditUser?.(user)}
            >
              <Edit />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-red-600">
              <Trash className="text-red-500" />
              Xoá
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const schema = z
  .object({
    id: z.string().optional(),
    fullName: z.string().min(1, "Tên người dùng không được để trống"),
    email: z.union([z.literal(""), z.string().email("Email sai định dạng")]),
    phone: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    role: z.enum([Role.ADMIN, Role.USER, Role.STAFF], {
      errorMap: () => ({ message: "Loại TK không hợp lệ" }),
    }),
    transferedAmount: z.number().min(0),
    willCreateAccount: z.boolean(),
  })
  .refine((data) => !data.willCreateAccount || data.username?.trim() !== "", {
    message: "Username là bắt buộc",
    path: ["username"],
  })
  .refine((data) => !data.willCreateAccount || data.password?.trim() !== "", {
    message: "Mật khẩu là bắt buộc",
    path: ["password"],
  })
  .refine((data) => !data.willCreateAccount || data.role, {
    message: "Loại TK là bắt buộc",
    path: ["role"],
  });

const UserListPage = () => {
  const [userList, setUserList] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isOpenAddTransfer, setOpenAddTransfer] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [userPanel, setUserPanel] = useState<{
    isOpen: boolean;
    type: "create" | "edit";
  }>({ isOpen: false, type: "create" });
  const [queryParams, setQueryParams] =
    useState<QueryDataModel>(initQueryParams);

  const { triggerLoading } = useTriggerLoading();
  const navigate = useNavigate();

  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: "",
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

  const getUserList = async (params: QueryDataModel) => {
    const { data } = await apiGetUsersListDetails(params);
    if (data.success) {
      setUserList(data.data.users ?? []);
      setQueryParams((prev) => ({
        ...prev,
        ...params,
        pagination: {
          ...params.pagination,
          totalCount: data.data.totalCount,
        },
      }));
    }
  };
  const onClickFullname = (userId: string) => navigate(`/user-list/${userId}`);
  const onClickEditUser = (user: User) => {
    setUserPanel((prev) => ({ ...prev, isOpen: true, type: "edit" }));
    setHasAccount(!!user.account?.username);
    userForm.reset({
      id: user.id,
      fullName: user.fullName,
      email: user.email ?? "",
      phone: user.phone ?? "",
      role: user.account?.role ?? Role.USER,
      username: user.account?.username,
      willCreateAccount: false,
      transferedAmount: 0,
      password: "",
    });
  };

  const onPaginationChange = async (pageIndex: number, pageSize: number) => {
    const newData = {
      ...queryParams,
      pagination: {
        ...queryParams.pagination,
        pageIndex,
        pageSize,
      },
    };
    triggerLoading(async () => {
      await getUserList(newData);
    });
  };

  const onCreateUpdateUser = async (data: UserFormValues) => {
    await triggerLoading(async () => {
      const promise =
        userPanel.type === "create" ? apiCreateUser : apiUpdateUser;
      await promise(data);

      toast.success(
        userPanel.type === "create"
          ? "Tạo user thành công"
          : "Chỉnh sửa thành công"
      );

      if (userPanel.type === "edit")
        setUserPanel((prev) => ({ ...prev, isOpen: false }));
      await getUserList(queryParams);
    });
  };

  const onAddTransfer = async (data: AddTransferModalFormValues) => {
    const currentTime = new Date();
    const combinedDateTime = setMilliseconds(
      setSeconds(
        setMinutes(
          setHours(data.createdAt as Date, currentTime.getHours()),
          currentTime.getMinutes()
        ),
        currentTime.getSeconds()
      ),
      currentTime.getMilliseconds()
    );

    const req = {
      ...data,
      createdAt: combinedDateTime,
      userId: selectedUser?.id as string,
    };

    await triggerLoading(async () => {
      await apiAddTransfer(req);
      await getUserList(queryParams);
      toast.success("Nạp tiền thành công.");
      setOpenAddTransfer(false);
    });
  };

  const onClickAddTransfer = (user: User) => {
    setOpenAddTransfer(true);
    setSelectedUser(user);
  };

  useEffect(() => {
    triggerLoading(async () => {
      await getUserList(initQueryParams);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
          Danh sách user
        </h3>
      </div>

      <Button
        size="sm"
        className="mb-6"
        onClick={() => setUserPanel((prev) => ({ ...prev, isOpen: true }))}
      >
        <PlusCircle /> Thêm user
      </Button>

      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={userList}
          manualPagination
          pagination={queryParams.pagination}
          onPaginationChange={onPaginationChange}
          meta={{
            onClickAddTransfer,
            onClickFullname,
            onClickEditUser,
          }}
        />
      </div>

      <UserPanel
        panelState={userPanel}
        setIsOpen={(value) =>
          setUserPanel((prev) => ({ ...prev, isOpen: value }))
        }
        onSubmit={onCreateUpdateUser}
        form={userForm}
        hasAccount={hasAccount}
      />

      <AddTransferModal
        open={isOpenAddTransfer}
        onOpenChange={setOpenAddTransfer}
        selectedUser={selectedUser}
        onSubmit={onAddTransfer}
      />
    </>
  );
};

export default UserListPage;
