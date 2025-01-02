import { DataTable } from "@/components/data-table/DataTable";
import { Option } from "@/components/multi-select/MutipleSelect";
import { Button } from "@/components/ui/button";
import {
  apiCreateOrder,
  apiGetOrderList,
  apiUpdateOrderStatus,
  OrderWithExtra,
} from "@/services/main/orderServices";
import { apiShippingStoresList } from "@/services/main/shipingStoreServices";
import { apiSourcesList } from "@/services/main/sourceServices";
import { apiGetUsersList } from "@/services/main/userServices";
import { DeliveryCodeStatus, OrderStatus } from "@/types/enum/app-enum";
import { initQueryParams, QueryDataModel } from "@/types/model/app-model";
import { FilterIcon, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getOrdercolumns } from "./order-list-columns";
import FilterPanel, { FilterFormValues } from "./panel/FilterPanel";
import OrderPanel, { OrderFormValues } from "./panel/OrderPanel";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "./panel/order-panel-schema";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import { toast } from "sonner";

const OrderListPage = ({ isCompleted }: { isCompleted: boolean }) => {
  const [orderList, setOrderList] = useState<OrderWithExtra[]>([]);
  const [userList, setUserList] = useState<Option[]>([]);
  const [sourceList, setSourceList] = useState<Option[]>([]);
  const [shippingStoreList, setShippingStoreList] = useState<Option[]>([]);
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
      users: [],
      sources: [],
      shippingStores: [],
      statuses: [],
    },
  });

  const orderForm = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      SKU: "",
      size: 10,
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
    },
  });

  const onStatusChange = async (id: string, status: OrderStatus) => {
    await triggerLoading(async () => {
      await apiUpdateOrderStatus({ id, status });
      await getOrderList(queryParams);
    });
  };

  const columns = getOrdercolumns({ onStatusChange });

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

  const onCreateOrder = async (data: OrderFormValues) => {
    await triggerLoading(async () => {
      await apiCreateOrder(data);
      toast.success("Tạo đơn hàng thành công.");
      await getOrderList(queryParams);
    });
  };

  useEffect(() => {
    triggerLoading(async () => {
      await Promise.all([
        getOrderList(initQueryParams),
        getUserList(),
        getSourceList(),
        getShippingStoreList(),
      ]);
    });
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
      await getOrderList(newData);
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

      {!isCompleted && (
        <Button
          size="sm"
          className="mb-6"
          onClick={() => setOrderPanel((prev) => ({ ...prev, isOpen: true }))}
        >
          <PlusCircle /> Thêm đơn hàng
        </Button>
      )}

      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={orderList.filter((item) =>
            isCompleted
              ? [OrderStatus.LANDED, OrderStatus.SHIPPED].includes(item.status)
              : true
          )}
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
        options={{ userList, sourceList, shippingStoreList }}
        isCompletedStatus={isCompleted}
      />
      <OrderPanel
        isOpen={orderPanel.isOpen}
        setIsOpen={(value) =>
          setOrderPanel((prev) => ({ ...prev, isOpen: value }))
        }
        onSubmit={onCreateOrder}
        form={orderForm}
        options={{ userList, sourceList, shippingStoreList }}
      />
    </>
  );
};

export default OrderListPage;
