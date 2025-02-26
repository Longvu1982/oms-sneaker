import { Option } from "@/components/multi-select/MutipleSelect";
import { Button } from "@/components/ui/button";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import {
  apiBulkDeleteOrder,
  apiCreateOrder,
  apiDeleteOrder,
  apiGetOrderList,
  apiUpdateOrder,
  OrderWithExtra,
} from "@/services/main/orderServices";
import { apiShippingStoresList } from "@/services/main/shippingStoreServices";
import { apiSourcesList } from "@/services/main/sourceServices";
import { apiGetUsersList } from "@/services/main/userServices";
import useAuthStore from "@/store/auth";
import { useGlobalModal } from "@/store/global-modal";
import { DeliveryCodeStatus, OrderStatus, Role } from "@/types/enum/app-enum";
import { initQueryParams, QueryDataModel } from "@/types/model/app-model";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FilterIcon,
  PlusCircle,
  Trash,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import FilterPanel, { FilterFormValues } from "./panel/FilterPanel";
import { schema } from "./panel/order-panel-schema";
import OrderPanel, { OrderFormValues } from "./panel/OrderPanel";
import { UploadOrderModal } from "./panel/UploadOrderModal";
import OrderTable from "./table/OrderTable";
import { RowSelectionState } from "@tanstack/react-table";

const initOrderFormValues = {
  SKU: "",
  size: "",
  deposit: 0,
  totalPrice: 0,
  deliveryCode: "",
  deliveryCodeStatus: DeliveryCodeStatus.PENDING,
  shippingFee: 0,
  secondShippingFee: 0,
  checkBox: false,
  orderNumber: "",
  userId: "",
  sourceId: "",
  shippingStoreId: "",
  status: OrderStatus.ONGOING,
  orderDate: new Date(),
};

const OrderListPage = ({ isCompleted }: { isCompleted: boolean }) => {
  const [orderList, setOrderList] = useState<OrderWithExtra[]>([]);
  const [userList, setUserList] = useState<Option[]>([]);
  const [sourceList, setSourceList] = useState<Option[]>([]);
  const [shippingStoreList, setShippingStoreList] = useState<Option[]>([]);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});

  const selectedRowsId = Object.entries(selectedRows)
    .filter(([, value]) => value)
    .map(([key]) => key);

  const user = useAuthStore((s) => s.user);
  const role = user?.account.role;

  const [queryParams, setQueryParams] = useState<QueryDataModel>({
    ...initQueryParams,
    filter: role === Role.USER ? [{ column: "userId", value: [user?.id] }] : [],
  });

  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [orderPanel, setOrderPanel] = useState<{
    isOpen: boolean;
    type: "create" | "edit";
  }>({ isOpen: false, type: "create" });

  const { triggerLoading } = useTriggerLoading();

  const filterForm = useForm<FilterFormValues>({
    defaultValues: {
      searchText: "",
      users: [],
      sources: [],
      shippingStores: [],
      statuses: [],
    },
  });

  const orderForm = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initOrderFormValues,
  });

  const onStatusChange = useCallback(
    async (id: string, status: OrderStatus) => {
      await triggerLoading(async () => {
        await apiUpdateOrder({ id, status } as OrderFormValues);
        await getOrderList(queryParams);
      });
    },
    [triggerLoading, queryParams]
  );

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
        { column: "sourceId", value: data.sources.map((s) => s.value) },
        {
          column: "shippingStoreId",
          value: data.shippingStores.map((ss) => ss.value),
        },
        { column: "orderDate", value: data.orderDate },
        { column: "statusChangeDate", value: data.statusChangeDate },
        { column: "status", value: data.statuses.map((u) => u.value) },
      ],
    };
    triggerLoading(async () => {
      await getOrderList(newData as QueryDataModel);
      setIsOpenFilter(false);
    });
  };

  const onCreateUpdateOrder = async (data: OrderFormValues) => {
    await triggerLoading(async () => {
      const promise =
        orderPanel.type === "create" ? apiCreateOrder : apiUpdateOrder;
      await promise(data);
      toast.success(
        orderPanel.type === "create"
          ? "Tạo đơn hàng thành công"
          : "Chỉnh sửa thành công"
      );

      if (orderPanel.type === "edit")
        setOrderPanel((prev) => ({ ...prev, isOpen: false }));

      await getOrderList(queryParams);
    });
  };

  useEffect(() => {
    triggerLoading(async () => {
      const initParams = { ...initQueryParams };
      if (role === Role.USER) {
        initParams.filter = [{ column: "userId", value: [user?.id] }];
      }
      await Promise.all([
        getOrderList(initParams),
        getUserList(),
        getSourceList(),
        getShippingStoreList(),
      ]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getOrderList = async (params: QueryDataModel) => {
    const { data } = await apiGetOrderList(params);
    if (data.success) {
      setOrderList(data.data.orders ?? []);
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

  const getSourceList = async () => {
    const { data } = await apiSourcesList({
      ...initQueryParams,
      pagination: { ...initQueryParams.pagination, pageSize: 0 },
    });
    if (data.success) {
      const options = data.data.sources.map((source) => ({
        value: source.id,
        label: source.name,
        meta: { color: source.color },
      }));
      setSourceList(options);
    }
  };

  const getShippingStoreList = async () => {
    const { data } = await apiShippingStoresList({
      ...initQueryParams,
      pagination: { ...initQueryParams.pagination, pageSize: 0 },
    });
    if (data.success) {
      const options = data.data.shippingStores.map((s) => ({
        value: s.id,
        label: s.name,
      }));
      setShippingStoreList(options);
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
      await getOrderList(newData);
    });
  };

  const onEditClick = useCallback(
    (data: OrderWithExtra) => {
      orderForm.reset({ ...data, orderDate: new Date(data.orderDate) });
      setOrderPanel((prev) => ({ ...prev, isOpen: true, type: "edit" }));
    },
    [orderForm]
  );

  const { openConfirmModal } = useGlobalModal();
  const onDeleteClick = async (data: OrderWithExtra) => {
    openConfirmModal({
      title: (
        <div className="flex gap-2 items-center">
          <TriangleAlert color="red" />
          <span>Xác nhận xóa đơn hàng?</span>
        </div>
      ),
      content:
        "Bạn có chắc muốn xóa đơn hàng này? Tất cả thông tin liên quan (người đặt hàng, doanh thu,... sẽ bị xoá)",
      confirmType: "alert",
      confirmText: "Xoá",
      onConfirm: (closeModal: () => void) =>
        triggerLoading(async () => {
          await apiDeleteOrder({ id: data.id });
          toast.success("Xoá đơn hàng thành công.");
          await getOrderList(queryParams);
          closeModal();
        }),
    });
  };

  const onBulkDeleteClick = async () => {
    openConfirmModal({
      title: (
        <div className="flex gap-2 items-center">
          <TriangleAlert color="red" />
          <span>Xác nhận xóa nhiều đơn hàng?</span>
        </div>
      ),
      content:
        "Bạn có chắc muốn xóa những đơn hàng này? Tất cả thông tin liên quan (người đặt hàng, doanh thu,... sẽ bị xoá)",
      confirmType: "alert",
      confirmText: "Xoá",
      onConfirm: (closeModal: () => void) =>
        triggerLoading(async () => {
          const { data } = await apiBulkDeleteOrder({ ids: selectedRowsId });
          if (data.success) {
            toast.success("Xoá nhiều đơn hàng thành công.");
            await getOrderList(queryParams);

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

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
          {!isCompleted ? "Danh sách đơn hàng" : "Đơn hàng hoàn tất"}
        </h3>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpenFilter(true)}
        >
          <FilterIcon />
        </Button>
      </div>

      {!isCompleted && role === Role.ADMIN && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              className="mb-6"
              onClick={() => {
                setOrderPanel({
                  type: "create",
                  isOpen: true,
                });
                orderForm.reset({ ...initOrderFormValues });
              }}
            >
              <PlusCircle /> Thêm đơn hàng
            </Button>
            <Button
              size="sm"
              className="mb-6"
              onClick={() => setOpenUploadModal(true)}
            >
              <Upload /> Tải Excel
            </Button>
          </div>
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
      )}

      <OrderTable
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        onPaginationChange={onPaginationChange}
        onStatusChange={onStatusChange}
        queryParams={queryParams}
        excludeColumns={isCompleted ? [] : ["statusChangeDate"]}
        selectedRows={selectedRows}
        onRowSelectionChange={setSelectedRows}
        orderList={orderList.filter((item) =>
          isCompleted
            ? [OrderStatus.LANDED, OrderStatus.SHIPPED].includes(item.status)
            : true
        )}
      />
      <FilterPanel
        isOpenFilter={isOpenFilter}
        setIsOpenFilter={setIsOpenFilter}
        onSubmit={onFilter}
        form={filterForm}
        options={{ userList, sourceList, shippingStoreList }}
        isCompletedStatus={isCompleted}
      />
      <OrderPanel
        onReloadUser={getUserList}
        panelState={orderPanel}
        setIsOpen={(value) =>
          setOrderPanel((prev) => ({ ...prev, isOpen: value }))
        }
        onSubmit={onCreateUpdateOrder}
        form={orderForm}
        options={{ userList, sourceList, shippingStoreList }}
      />

      <UploadOrderModal
        open={openUploadModal}
        onOpenChange={setOpenUploadModal}
        getList={async () => await getOrderList(queryParams)}
      />
    </>
  );
};

export default OrderListPage;
