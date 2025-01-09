import { DataTable } from "@/components/data-table/DataTable";
import { EnhancedColumnDef } from "@/components/data-table/dataTable.utils";
import { Option } from "@/components/multi-select/MutipleSelect";
import { Button } from "@/components/ui/button";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import { renderBadge } from "@/lib/utils";
import {
  apiCreateTransaction,
  apiGetTransactionList,
} from "@/services/main/transactionServices";
import { apiGetUsersList } from "@/services/main/userServices";
import { NatureType, TransactionType } from "@/types/enum/app-enum";
import {
  initQueryParams,
  QueryDataModel,
  TransactionWithExtra,
} from "@/types/model/app-model";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { FilterIcon, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import FilterPanel, { FilterFormValues } from "./panel/FilterPanel";
import { schema } from "./panel/transaction-panel-schema";
import TransactionPanel, {
  TransactionFormValues,
} from "./panel/TransactionPanel";
import { natureObject, transactionTypeObject } from "./transaction-utils";

const columns: EnhancedColumnDef<TransactionWithExtra>[] = [
  {
    accessorKey: "createdAt",
    header: "Ngày GD",
    cell: ({ getValue }) => {
      return (
        <div className="whitespace-nowrap">
          {format(getValue() as string, "dd/MM/yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Loại GD",
    cell: ({ getValue }) => {
      const { color, text } =
        transactionTypeObject[getValue() as TransactionType] ?? {};
      return renderBadge(color, text);
    },
  },
  {
    accessorKey: "user",
    header: "Tên khách",
    cell: ({ row }) => {
      const { user } = row.original;
      return <div className="whitespace-nowrap">{user?.fullName}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: "Số lượng",
  },
  {
    accessorKey: "rate",
    header: "Tỉ giá",
  },
  {
    accessorKey: "nature",
    header: "Tính chất",
    cell: ({ getValue }) => {
      const { color, text } = natureObject[getValue() as NatureType] ?? {};
      return renderBadge(color, text);
    },
  },
];

const TransactionListPage = () => {
  const [transactionList, setTransactionList] = useState<
    TransactionWithExtra[]
  >([]);
  const [userList, setUserList] = useState<Option[]>([]);
  const [queryParams, setQueryParams] =
    useState<QueryDataModel>(initQueryParams);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [orderPanel, setOrderPanel] = useState<{
    isOpen: boolean;
    type: "create" | "edit";
  }>({ isOpen: false, type: "create" });

  const { triggerLoading } = useTriggerLoading();

  const filterForm = useForm<FilterFormValues>({
    defaultValues: {
      searchText: "",
      natures: [],
      types: [],
      users: [],
    },
  });

  const transactionForm = useForm<TransactionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 0,
      rate: 0,
      nature: NatureType.IN,
      type: undefined,
      userId: undefined,
    },
  });

  const onFilter = async (data: FilterFormValues) => {
    const newData = {
      ...queryParams,
      pagination: {
        ...queryParams.pagination,
        pageIndex: 0,
      },
      searchText: data.searchText,
      filter: [
        { column: "userId", value: data.users.map((u) => u.value) },
        {
          column: "type",
          value: data.types.map((ss) => ss.value),
        },
        {
          column: "nature",
          value: data.natures.map((ss) => ss.value),
        },
        { column: "createdAt", value: data.createdAt },
      ],
    };
    triggerLoading(async () => {
      await getTransactionList(newData as QueryDataModel);
      setIsOpenFilter(false);
    });
  };

  const onCreateTransaction = async (data: TransactionFormValues) => {
    await triggerLoading(async () => {
      await apiCreateTransaction(data);
      toast.success("Tạo giao dịch thành công.");
      await getTransactionList(queryParams);
    });
  };

  useEffect(() => {
    triggerLoading(async () => {
      await Promise.all([getTransactionList(initQueryParams), getUserList()]);
    });
  }, []);

  const getTransactionList = async (params: QueryDataModel) => {
    const { data } = await apiGetTransactionList(params);
    if (data.success) {
      setTransactionList(data.data.transactions ?? []);
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

  const getUserList = async () => {
    const { data } = await apiGetUsersList({
      ...initQueryParams,
      pagination: { ...initQueryParams.pagination, pageSize: 0 },
    });
    if (data.success) {
      const options = data.data.users.map((user) => ({
        value: user.id,
        label: user.fullName,
      }));
      setUserList(options);
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
      await getTransactionList(newData);
    });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
          Danh sách giao dịch
        </h3>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpenFilter(true)}
        >
          <FilterIcon />
        </Button>
      </div>

      <Button
        size="sm"
        className="mb-6"
        onClick={() => setOrderPanel((prev) => ({ ...prev, isOpen: true }))}
      >
        <PlusCircle /> Thêm giao dịch
      </Button>

      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={transactionList}
          manualPagination
          pagination={queryParams.pagination}
          onPaginationChange={onPaginationChange}
        />
      </div>
      <FilterPanel
        isOpenFilter={isOpenFilter}
        setIsOpenFilter={setIsOpenFilter}
        onSubmit={onFilter}
        form={filterForm}
        options={{ userList }}
      />
      <TransactionPanel
        isOpen={orderPanel.isOpen}
        setIsOpen={(value) =>
          setOrderPanel((prev) => ({ ...prev, isOpen: value }))
        }
        onSubmit={onCreateTransaction}
        form={transactionForm}
        options={{ userList }}
      />
    </>
  );
};

export default TransactionListPage;
