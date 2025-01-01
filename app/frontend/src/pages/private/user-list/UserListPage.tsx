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
import {
  apiCreateUser,
  apiGetUsersListDetails,
  UserFormValues,
} from "@/services/main/userServices";
import { initQueryParams, QueryDataModel, User } from "@/types/model/app-model";
import { Edit, MoreHorizontal, PlusCircle, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{getValue() as string}</span>
    ),
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
    cell: () => {
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
            <DropdownMenuItem className="cursor-pointer">
              <PlusCircle />
              Nạp tiền
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
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

const UserListPage = () => {
  const [userList, setUserList] = useState<User[]>([]);
  const [userPanel, setUserPanel] = useState<{
    isOpen: boolean;
    type: "create" | "edit";
  }>({ isOpen: false, type: "create" });
  const [queryParams, setQueryParams] =
    useState<QueryDataModel>(initQueryParams);

  const { triggerLoading } = useTriggerLoading();

  const userForm = useForm<UserFormValues>({
    // resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      username: "",
      password: "",
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

  const onCreateUser = async (data: UserFormValues) => {
    await triggerLoading(async () => {
      await apiCreateUser(data);
      toast.success("Tạo user thành công.");
      await getUserList(queryParams);
    });
  };

  useEffect(() => {
    triggerLoading(async () => {
      await getUserList(initQueryParams);
    });
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
        />
      </div>

      <UserPanel
        isOpen={userPanel.isOpen}
        setIsOpen={(value) =>
          setUserPanel((prev) => ({ ...prev, isOpen: value }))
        }
        onSubmit={onCreateUser}
        form={userForm}
      />
    </>
  );
};

export default UserListPage;