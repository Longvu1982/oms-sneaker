import { Option } from "@/components/multi-select/MutipleSelect";
import { Button } from "@/components/ui/button";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import {
  apiCreateOrder,
  apiGetOrderList,
  apiUpdateOrder,
  OrderWithExtra,
} from "@/services/main/orderServices";
import { apiShippingStoresList } from "@/services/main/shipingStoreServices";
import { apiSourcesList } from "@/services/main/sourceServices";
import { apiGetUsersList } from "@/services/main/userServices";
import { DeliveryCodeStatus, OrderStatus, Role } from "@/types/enum/app-enum";
import { initQueryParams, QueryDataModel } from "@/types/model/app-model";
import { zodResolver } from "@hookform/resolvers/zod";
import { FilterIcon, PlusCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import FilterPanel, { FilterFormValues } from "./panel/FilterPanel";
import { schema } from "./panel/order-panel-schema";
import OrderPanel, { OrderFormValues } from "./panel/OrderPanel";
import OrderTable from "./table/OrderTable";
import useAuthStore from "@/store/auth";

const initOrderFormValues = {
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
  orderDate: new Date(),
};

const OrderListPage = ({ isCompleted }: { isCompleted: boolean }) => {
  const [orderList, setOrderList] = useState<OrderWithExtra[]>([]);
  const [userList, setUserList] = useState<Option[]>([]);
  const [sourceList, setSourceList] = useState<Option[]>([]);
  const [shippingStoreList, setShippingStoreList] = useState<Option[]>([]);

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
    data: OrderFormValues;
  }>({ isOpen: false, type: "create", data: {} as OrderFormValues });

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
          ? "Tạo đơn hàng thành công."
          : "Chỉnh sửa thành công."
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

  const onEditClick = useCallback(
    (data: OrderWithExtra) => {
      orderForm.reset({ ...data, orderDate: new Date(data.orderDate) });
      setOrderPanel((prev) => ({ ...prev, isOpen: true, type: "edit" }));
    },
    [orderForm]
  );

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
        <Button
          size="sm"
          className="mb-6"
          onClick={() => {
            setOrderPanel({
              type: "create",
              isOpen: true,
              data: {} as OrderFormValues,
            });
            orderForm.reset({ ...initOrderFormValues });
          }}
        >
          <PlusCircle /> Thêm đơn hàng
        </Button>
      )}

      <OrderTable
        onEditClick={onEditClick}
        onPaginationChange={onPaginationChange}
        onStatusChange={onStatusChange}
        queryParams={queryParams}
        excludeColumns={isCompleted ? [] : ["statusChangeDate"]}
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
    </>
  );
};

export default OrderListPage;
