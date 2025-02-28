import { DataTable } from "@/components/data-table/DataTable";
import { EnhancedColumnDef } from "@/components/data-table/dataTable.utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  apiBulkDeleteUser,
  apiCreateUser,
  apiDeleteUser,
  apiGetUsersListDetails,
  apiUpdateUser,
  UserFormValues,
} from "@/services/main/userServices";
import useAuthStore from "@/store/auth";
import { useGlobalModal } from "@/store/global-modal";
import { Role } from "@/types/enum/app-enum";
import { initQueryParams, QueryDataModel, User } from "@/types/model/app-model";
import { zodResolver } from "@hookform/resolvers/zod";
import { RowSelectionState } from "@tanstack/react-table";
import { setHours, setMilliseconds, setMinutes, setSeconds } from "date-fns";
import {
  Edit,
  MoreHorizontal,
  PlusCircle,
  Trash,
  TriangleAlert,
} from "lucide-react";
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
      const onDeleteUserClick = table.options.meta?.onDeleteUserClick;
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
            <DropdownMenuItem
              className="cursor-pointer text-red-600"
              onClick={() => onDeleteUserClick?.(user.id)}
            >
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

const initFormValues: UserFormValues = {
  id: "",
  fullName: "",
  email: "",
  phone: "",
  username: "",
  password: "",
  role: Role.USER,
  transferedAmount: 0,
  willCreateAccount: false,
};

const UserListPage = () => {
  const [userList, setUserList] = useState<User[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isOpenAddTransfer, setOpenAddTransfer] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [userPanel, setUserPanel] = useState<{
    isOpen: boolean;
    type: "create" | "edit";
  }>({ isOpen: false, type: "create" });
  const [queryParams, setQueryParams] =
    useState<QueryDataModel>(initQueryParams);
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});

  const currentUserId = useAuthStore((s) => s.user?.id);

  const selectedRowsId = Object.entries(selectedRows)
    .filter(([, value]) => value)
    .map(([key]) => key);

  const { triggerLoading } = useTriggerLoading();
  const navigate = useNavigate();

  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initFormValues,
  });

  const getUserList = async (params: QueryDataModel) => {
    const { data } = await apiGetUsersListDetails(params);
    if (data.success) {
      setUserList(data.data.users ?? []);
      setTotalBalance(data.data.totalBalance);
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

  const onPaginationChange = async ({
    pageIndex,
    pageSize,
  }: {
    pageIndex: number;
    pageSize: number;
  }) => {
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

  const { openConfirmModal } = useGlobalModal();
  const onDeleteUserClick = async (id: string) => {
    openConfirmModal({
      title: (
        <div className="flex gap-2 items-center">
          <TriangleAlert color="red" />
          <span>Xác nhận xóa user?</span>
        </div>
      ),
      content:
        "Bạn có chắc muốn xóa user này? Tất cả thông tin liên quan (đơn đặt hàng, doanh thu,... sẽ bị xoá)",
      confirmType: "alert",
      confirmText: "Xoá",
      onConfirm: (closeModal: () => void) =>
        triggerLoading(async () => {
          await apiDeleteUser({ id });
          toast.success("Xoá user thành công.");
          await getUserList(queryParams);
          closeModal();
        }),
    });
  };

  const onBulkDeleteClick = async () => {
    openConfirmModal({
      title: (
        <div className="flex gap-2 items-center">
          <TriangleAlert color="red" />
          <span>Xác nhận xóa nhiều user?</span>
        </div>
      ),
      content:
        "Bạn có chắc muốn xóa những user này? Tất cả thông tin liên quan (người đặt hàng, doanh thu,... sẽ bị xoá)",
      confirmType: "alert",
      confirmText: "Xoá",
      onConfirm: (closeModal: () => void) =>
        triggerLoading(async () => {
          const { data } = await apiBulkDeleteUser({ ids: selectedRowsId });
          if (data.success) {
            toast.success("Xoá nhiều user thành công.");
            await getUserList(queryParams);

            closeModal();
          }
        }),
    });
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

      <div className="flex items-center justify-between mb-6">
        <Button
          size="sm"
          onClick={() => {
            setUserPanel((prev) => ({ ...prev, type: "create", isOpen: true }));
            userForm.reset({ ...initFormValues });
          }}
        >
          <PlusCircle /> Thêm user
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-red-500 hover:bg-red-500 hover:opacity-75"
          disabled={!selectedRowsId.length}
          onClick={onBulkDeleteClick}
        >
          <Trash className="text-white" />
        </Button>
      </div>

      <p className="mb-4">
        Số lượng: <strong>{queryParams.pagination.totalCount}</strong>
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số dư</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span
                className={cn(
                  totalBalance < 0 ? "text-red-500" : "text-green-600"
                )}
              >
                {formatAmount(totalBalance)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={userList}
          manualPagination
          pagination={queryParams.pagination}
          onPaginationChange={onPaginationChange}
          selectedRows={selectedRows}
          onRowSelectionChange={setSelectedRows}
          enableRowSelection={(row) => row.id !== currentUserId}
          meta={{
            onClickAddTransfer,
            onClickFullname,
            onClickEditUser,
            onDeleteUserClick,
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
