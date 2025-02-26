import { Option } from "@/components/multi-select/MutipleSelect";
import { Button } from "@/components/ui/button";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import {
  apiBulkDeleteTransaction,
  apiCreateTransaction,
  apiDeleteTransaction,
  apiGetTransactionList,
  apiUpdateTransaction,
  TransactionFormValues,
} from "@/services/main/transactionServices";
import { apiGetUsersList } from "@/services/main/userServices";
import { useGlobalModal } from "@/store/global-modal";
import { NatureType } from "@/types/enum/app-enum";
import {
  initQueryParams,
  QueryDataModel,
  TransactionWithExtra,
} from "@/types/model/app-model";
import { zodResolver } from "@hookform/resolvers/zod";
import { RowSelectionState } from "@tanstack/react-table";
import { FilterIcon, PlusCircle, Trash, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import FilterPanel, { FilterFormValues } from "./panel/FilterPanel";
import { schema } from "./panel/transaction-panel-schema";
import TransactionPanel from "./panel/TransactionPanel";
import TransactionTable from "./table/TransactionTable";

const initValues = {
  amount: 0,
  rate: 0,
  nature: NatureType.IN,
  type: undefined,
  userId: undefined,
};

const TransactionListPage = () => {
  const [transactionList, setTransactionList] = useState<
    TransactionWithExtra[]
  >([]);
  const [userList, setUserList] = useState<Option[]>([]);
  const [queryParams, setQueryParams] =
    useState<QueryDataModel>(initQueryParams);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [transactionPanel, setTransactionPanel] = useState<{
    isOpen: boolean;
    type: "create" | "edit";
  }>({ isOpen: false, type: "create" });

  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});

  const selectedRowsId = Object.entries(selectedRows)
    .filter(([, value]) => value)
    .map(([key]) => key);

  const { triggerLoading } = useTriggerLoading();
  const { openConfirmModal } = useGlobalModal();

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
    defaultValues: initValues,
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

  const onCreateUpdateTransaction = async (data: TransactionFormValues) => {
    await triggerLoading(async () => {
      const promise =
        transactionPanel.type === "create"
          ? apiCreateTransaction
          : apiUpdateTransaction;

      await promise(data);
      toast.success(
        transactionPanel.type === "create"
          ? "Tạo giao dịch thành công."
          : "Chỉnh sửa thành công"
      );

      if (transactionPanel.type === "edit")
        setTransactionPanel((prev) => ({ ...prev, isOpen: false }));

      await getTransactionList(queryParams);
    });
  };

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
      await getTransactionList(newData);
    });
  };

  const onEditTransactionClick = async (data: TransactionWithExtra) => {
    transactionForm.reset({ ...data });
    setTransactionPanel((prev) => ({ ...prev, isOpen: true, type: "edit" }));
  };

  const onDeleteTransactionClick = async (id: string) => {
    openConfirmModal({
      title: (
        <div className="flex gap-2 items-center">
          <TriangleAlert color="red" />
          <span>Xác nhận xóa giao dịch?</span>
        </div>
      ),
      content:
        "Bạn có chắc muốn xóa giao dịch này? Tất cả thông tin liên quan (người đặt hàng, doanh thu,... sẽ bị xoá)",
      confirmType: "alert",
      confirmText: "Xoá",
      onConfirm: (closeModal: () => void) =>
        triggerLoading(async () => {
          await apiDeleteTransaction({ id });
          toast.success("Xoá giao dịch thành công.");
          await getTransactionList(queryParams);
          closeModal();
        }),
    });
  };

  const onBulkDeleteClick = async () => {
    openConfirmModal({
      title: (
        <div className="flex gap-2 items-center">
          <TriangleAlert color="red" />
          <span>Xác nhận xóa nhiều giao dịch?</span>
        </div>
      ),
      content:
        "Bạn có chắc muốn xóa những giao dịch này? Tất cả thông tin liên quan (người đặt hàng, doanh thu,... sẽ bị xoá)",
      confirmType: "alert",
      confirmText: "Xoá",
      onConfirm: (closeModal: () => void) =>
        triggerLoading(async () => {
          const { data } = await apiBulkDeleteTransaction({
            ids: selectedRowsId,
          });
          if (data.success) {
            toast.success("Xoá nhiều giao dịch thành công.");
            await getTransactionList(queryParams);

            setSelectedRows((prev) => {
              const clone = { ...prev };
              selectedRowsId.forEach((id) => {
                delete clone[id];
              });

              return clone;
            });

            closeModal();
          }
        }),
    });
  };

  useEffect(() => {
    triggerLoading(async () => {
      await Promise.all([getTransactionList(initQueryParams), getUserList()]);
    });
  }, []);

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

      <div className="flex items-center justify-between">
        <Button
          size="sm"
          className="mb-6"
          onClick={() => {
            setTransactionPanel((prev) => ({
              ...prev,
              type: "create",
              isOpen: true,
            }));

            transactionForm.reset({ ...initValues });
          }}
        >
          <PlusCircle /> Thêm giao dịch
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

      <TransactionTable
        queryParams={queryParams}
        transactionList={transactionList}
        onPaginationChange={onPaginationChange}
        onEditTransactionClick={onEditTransactionClick}
        onDeleteTransactionClick={onDeleteTransactionClick}
        selectedRows={selectedRows}
        onRowSelectionChange={setSelectedRows}
      />
      <FilterPanel
        isOpenFilter={isOpenFilter}
        setIsOpenFilter={setIsOpenFilter}
        onSubmit={onFilter}
        form={filterForm}
        options={{ userList }}
      />
      <TransactionPanel
        isOpen={transactionPanel.isOpen}
        setIsOpen={(value) =>
          setTransactionPanel((prev) => ({ ...prev, isOpen: value }))
        }
        onSubmit={onCreateUpdateTransaction}
        form={transactionForm}
        options={{ userList }}
      />
    </>
  );
};

export default TransactionListPage;
