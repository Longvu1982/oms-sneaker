import ComboBox from "@/components/combo-box/ComboBox";
import { CommandSearch } from "@/components/command-search/CommandSearch";
import { Option } from "@/components/multi-select/MutipleSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useDebounce from "@/hooks/use-debounce-value";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import { cn, formatAmount, renderBadge } from "@/lib/utils";
import {
  apiBulkDeleteOrder,
  apiBulkUpdateOrderStatus,
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
import {
  initQueryParams,
  orderStatusOptions,
  QueryDataModel,
} from "@/types/model/app-model";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckedState } from "@radix-ui/react-checkbox";
import { RowSelectionState } from "@tanstack/react-table";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  FileText,
  FilterIcon,
  PlusCircle,
  Trash,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ViewportListRef } from "react-viewport-list";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { orderStatusObject } from "./order-list-utils";
import FilterPanel, {
  countActiveFilters,
  FilterFormValues,
} from "./panel/FilterPanel";
import { schema } from "./panel/order-panel-schema";
import OrderPanel, { OrderFormValues } from "./panel/OrderPanel";
import { UploadOrderModal } from "./panel/UploadOrderModal";
import OrderTable from "./table/OrderTable";

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

const OrderListPage = ({
  orderStatuses,
  title,
  type,
}: {
  type: string;
  orderStatuses: OrderStatus[];
  title: string;
}) => {
  const [orderList, setOrderList] = useState<OrderWithExtra[]>([]);
  const [userList, setUserList] = useState<Option[]>([]);
  const [sourceList, setSourceList] = useState<Option[]>([]);
  const [shippingStoreList, setShippingStoreList] = useState<Option[]>([]);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
  const [targetStatus, setTargetStatus] = useState<OrderStatus | "">("");
  const [appliedFilters, setAppliedFilters] = useState<FilterFormValues | null>(
    null
  );
  const [showGroupUser, setShowGroupUser] = useState<CheckedState>(true);
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);
  const [orderTab, setOrderTab] = useState<"full" | "selected">("full");
  const [groupedOrders, setGroupedOrders] = useState<
    {
      userId: string;
      fullName: string;
      totalAmount: number;
      data: OrderWithExtra[];
    }[]
  >([]);

  const viewportRef = useRef<ViewportListRef>(null);

  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectedRowsId = useMemo(
    () =>
      Object.entries(selectedRows)
        .filter(([, value]) => value)
        .map(([key]) => key),
    [selectedRows]
  );

  const selectedOrders = useMemo(
    () => orderList.filter((order) => selectedRowsId.includes(order.id)),
    [orderList, selectedRowsId]
  );

  const finalOrderList = useMemo(() => {
    if (orderTab === "selected") return selectedOrders;
    return orderList;
  }, [selectedOrders, orderList, orderTab]);

  const totalSelectedValues = useMemo(() => {
    const selectedList = orderList.filter((item) =>
      selectedRowsId.includes(item.id)
    );

    return selectedList.reduce((acc, item) => {
      return (
        acc +
        (item.totalPrice ?? 0) -
        (item.deposit ?? 0) +
        (item.shippingFee ?? 0)
      );
    }, 0);
  }, [orderList, selectedRowsId]);

  const user = useAuthStore((s) => s.user);
  const role = user?.account.role;

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
      deliveryCodeStatuses: [],
    },
  });

  const deferredSearchText = useDebounce(filterForm.watch("searchText"), 300);

  const orderForm = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initOrderFormValues,
  });

  const clientSearchOrderResult = useMemo(
    () =>
      finalOrderList.filter((order) => {
        const searchText = deferredSearchText?.trim()?.toLowerCase() ?? "";
        return (
          order.SKU.toLowerCase().includes(searchText) ||
          order.orderNumber.toLowerCase().includes(searchText) ||
          order.size.toLowerCase().includes(searchText) ||
          order.deliveryCode.toLowerCase().includes(searchText) ||
          order.user.fullName.toLowerCase().includes(searchText)
        );
      }),
    [deferredSearchText, finalOrderList]
  );

  const excludeColumns = useMemo(() => {
    const result = [];
    if (type === "list" || type === "canceled")
      result.push("statusChangeDate", "shippingFee");
    if (type !== "landed") result.push("checkBox");
    if (type !== "list") result.push("secondShippingFee");
    return result;
  }, [type]);

  const onStatusChange = useCallback(
    async (id: string, status: OrderStatus) => {
      await triggerLoading(async () => {
        await apiUpdateOrder({ id, status } as OrderFormValues);
        await getOrderList(queryParams);
      });
    },
    [triggerLoading, queryParams]
  );

  const onChangeOrderCheckBox = useCallback(
    async (id: string, checkBox: boolean) => {
      await triggerLoading(async () => {
        await apiUpdateOrder({ id, checkBox } as OrderFormValues);
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
        {
          column: "userId",
          value: data.users.map((u) => u.value),
        },
        { column: "sourceId", value: data.sources.map((s) => s.value) },
        {
          column: "shippingStoreId",
          value: data.shippingStores.map((ss) => ss.value),
        },
        { column: "orderDate", value: data.orderDate },
        { column: "statusChangeDate", value: data.statusChangeDate },
        { column: "status", value: orderStatuses },
        {
          column: "deliveryCodeStatus",
          value: data.deliveryCodeStatuses.map((dcs) => dcs.value),
        },
      ],
    };
    triggerLoading(async () => {
      await getOrderList(newData as QueryDataModel);
      setIsOpenFilter(false);
      setAppliedFilters(data);
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

      initParams.filter = [
        { column: "status", value: orderStatuses },
        { column: "userId", value: role === Role.USER ? [user?.id] : [] },
      ];
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
      setGroupedOrders(data.data.groupedOrders ?? []);
      setExpandedUsers([]);
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
    if (role !== Role.ADMIN) return;
    const { data } = await apiGetUsersList({
      ...initQueryParams,
      pagination: { ...initQueryParams.pagination, pageSize: 0 },
      filter: [],
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
    if (role !== Role.ADMIN) return;
    const { data } = await apiSourcesList({
      ...initQueryParams,
      pagination: { ...initQueryParams.pagination, pageSize: 0 },
      filter: [],
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
    if (role !== Role.ADMIN) return;
    const { data } = await apiShippingStoresList({
      ...initQueryParams,
      pagination: { ...initQueryParams.pagination, pageSize: 0 },
      filter: [],
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

            closeModal();
          }
        }),
    });
  };

  const onBulkUpdateStatusClick = async (status: OrderStatus) => {
    const props = orderStatusObject[status] ?? {};
    const statusBadge = renderBadge(props.color, props.text);

    openConfirmModal({
      title: (
        <div className="flex gap-2 items-center">
          <TriangleAlert color="red" />
          <span>Xác nhận thay đổi trạng thái nhiều đơn hàng?</span>
        </div>
      ),
      content: (
        <div>
          Trạng thái sẽ được sửa thành {statusBadge}
          <p>Ngày thay đổi trạng thái sẽ bị chỉnh sửa</p>
        </div>
      ),
      confirmType: "alert",
      confirmText: "Áp dụng",
      onConfirm: (closeModal: () => void) =>
        triggerLoading(async () => {
          const { data } = await apiBulkUpdateOrderStatus({
            ids: selectedRowsId,
            status: status,
          });
          if (data.success) {
            toast.success("Chỉnh sửa thành công.");
            await getOrderList(queryParams);

            setTargetStatus("");
            closeModal();
          }
        }),
    });
  };
  const getCardColor = (length: number) => {
    if (length <= 2) return "bg-green-100/40";
    if (length <= 10 && length > 2) return "bg-orange-100/40";
    return "bg-rose-100/40";
  };

  const handleExportData = (type: "excel" | "csv") => {
    // Prepare the data
    const data = orderList.map((order) => ({
      ["Ngày order"]: order.orderDate
        ? format(order.orderDate, "dd/MM/yyyy")
        : "",
      ["Ngày chuyển TT"]: order.statusChangeDate
        ? format(order.statusChangeDate, "dd/MM/yyyy")
        : "",
      SKU: order.SKU,
      size: order.size,
      ["Giá"]: formatAmount(order.totalPrice),
      ["Trạng thái"]: orderStatusObject[order.status].text,
      ["Mã vận đơn"]: order.deliveryCode,
    }));

    if (type === "excel") {
      // Excel export logic
      const worksheet = XLSX.utils.json_to_sheet(data);

      worksheet["!cols"] = [
        { width: 15 },
        { width: 15 },
        { width: 25 },
        { width: 10 },
        { width: 15 },
        { width: 15 },
      ]; //set col. widths

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blobXLSX = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });
      const fileName = `order__${format(new Date(), "dd-MM-yyyy")}__${
        orderList.length
      } of ${queryParams.pagination.totalCount}.xlsx`;

      saveAs(blobXLSX, fileName);
    } else {
      // CSV export logic
      const worksheet = XLSX.utils.json_to_sheet(data);
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      const blobCSV = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const fileName = `order__${format(new Date(), "dd-MM-yyyy")}__${
        orderList.length
      } of ${queryParams.pagination.totalCount}.csv`;

      saveAs(blobCSV, fileName);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
          {title}
        </h3>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpenFilter(true)}
          >
            <FilterIcon />
          </Button>
          {appliedFilters && countActiveFilters(appliedFilters) > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {countActiveFilters(appliedFilters)}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          {role === Role.ADMIN && (
            <>
              <Button
                size="sm"
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
              <Button size="sm" onClick={() => setOpenUploadModal(true)}>
                <Upload /> Tải Excel
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <Download className="mr-[2px]" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExportData("excel")}>
                <FileSpreadsheet className="mr-[2px] h-4 w-4" />
                <span>
                  Export file <strong className="text-green-600">Excel</strong>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData("csv")}>
                <FileText className="mr-[2px] h-4 w-4" />
                <span>
                  Export file <strong className="text-blue-600">CSV</strong>
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {role === Role.ADMIN && (
          <div className="flex items-center gap-2">
            <ComboBox
              value={targetStatus}
              onValueChange={(value) =>
                onBulkUpdateStatusClick(value as OrderStatus)
              }
              searchable={false}
              label="Trạng thái đơn hàng"
              options={orderStatusOptions}
              disabled={!selectedRowsId.length}
              renderOption={(option) => {
                const props =
                  orderStatusObject[option.value as OrderStatus] ?? {};
                return renderBadge(props.color, option.label);
              }}
            />
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
      </div>

      <p className="mb-4">
        Số lượng: <strong>{queryParams.pagination.totalCount}</strong>
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đã chọn:{" "}
              <strong className="text-red-500">{selectedRowsId.length}</strong>{" "}
              đơn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span
                className={cn(
                  totalSelectedValues < 0 ? "text-red-500" : "text-green-600"
                )}
              >
                {formatAmount(totalSelectedValues)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {role === Role.ADMIN &&
        ["landed", "complete"].includes(type) &&
        groupedOrders.length > 0 && (
          <>
            <div className="flex items-center gap-2 py-2 mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={showGroupUser}
                  onCheckedChange={setShowGroupUser}
                />
                <span>Hiển thị nhóm user</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  if (expandedUsers.length === groupedOrders.length) {
                    setExpandedUsers([]);
                  } else {
                    setExpandedUsers(
                      groupedOrders.map((group) => group.userId)
                    );
                  }
                }}
              >
                <ChevronsUpDown className="h-4 w-4" />
                {expandedUsers.length !== groupedOrders.length
                  ? "Mở tất cả"
                  : "Đóng tất cả"}
              </Button>
            </div>

            {showGroupUser && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedOrders.map((group) => (
                  <Card key={group.userId} className="overflow-hidden h-fit">
                    <CardHeader
                      className={cn(
                        "cursor-pointer hover:opacity-65 transition-opacity",
                        getCardColor(group.data.length)
                      )}
                      onClick={() => toggleUserExpanded(group.userId)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                            {group.fullName}
                            <Badge variant="outline">
                              {group.data.length} đơn hàng
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Tổng:{" "}
                            <span className="font-bold text-green-600">
                              {formatAmount(group.totalAmount)}
                            </span>
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="ml-2">
                          {expandedUsers.includes(group.userId) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>

                    {expandedUsers.includes(group.userId) && (
                      <CardContent className="p-0">
                        <div className="max-h-[600px] overflow-auto">
                          <OrderTable
                            queryParams={queryParams}
                            excludeColumns={[
                              "statusChangeDate",
                              "shippingFee",
                              "orderDate",
                              "deposit",
                              "secondShippingFee",
                              "user",
                              "actions",
                              "checkBox",
                              "orderNumber",
                              "source",
                              "shippingStore",
                              "status",
                            ]}
                            orderList={group.data}
                            showPagination={false}
                          />
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

      <Tabs
        className="mt-6"
        value={orderTab}
        onValueChange={(value) => setOrderTab(value as "full" | "selected")}
      >
        <TabsList>
          <TabsTrigger value="full">Đơn hàng</TabsTrigger>
          <TabsTrigger value="selected">Đã chọn</TabsTrigger>
        </TabsList>
        <TabsContent value="full">
          <OrderTable
            viewportRef={viewportRef}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            onPaginationChange={onPaginationChange}
            onStatusChange={onStatusChange}
            queryParams={queryParams}
            excludeColumns={excludeColumns}
            selectedRows={selectedRows}
            onRowSelectionChange={setSelectedRows}
            orderList={orderList}
            onReload={() => getOrderList(queryParams)}
            onChangeOrderCheckBox={onChangeOrderCheckBox}
          />
        </TabsContent>
        <TabsContent value="selected" className="pt-4">
          <OrderTable
            viewportRef={viewportRef}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            showPagination={false}
            onPaginationChange={onPaginationChange}
            onStatusChange={onStatusChange}
            queryParams={queryParams}
            excludeColumns={excludeColumns}
            selectedRows={selectedRows}
            onRowSelectionChange={setSelectedRows}
            orderList={orderList.filter((item) =>
              selectedRowsId.includes(item.id)
            )}
            onReload={() => getOrderList(queryParams)}
            onChangeOrderCheckBox={onChangeOrderCheckBox}
          />
        </TabsContent>
      </Tabs>
      <FilterPanel
        isOpenFilter={isOpenFilter}
        setIsOpenFilter={setIsOpenFilter}
        onSubmit={onFilter}
        form={filterForm}
        options={{ userList, sourceList, shippingStoreList }}
        orderStatuses={orderStatuses}
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

      <CommandSearch
        value={filterForm.watch("searchText")}
        onValueChange={(value) => {
          filterForm.setValue("searchText", value);
        }}
        results={clientSearchOrderResult.map((order) => order.id)}
        onChangeResult={(result) => {
          const recordIndex = finalOrderList.findIndex(
            (order) => order.id === result
          );
          if (recordIndex > -1) {
            viewportRef?.current?.scrollToIndex({ index: recordIndex });
          }
        }}
      />
    </>
  );
};

export default OrderListPage;
