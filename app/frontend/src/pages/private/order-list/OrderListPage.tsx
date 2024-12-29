import { DataTable } from "@/components/data-table/DataTable";
import { apiGetOrderList, OrderWithExtra } from "@/services/main/orderServices";
import { useEffect, useState } from "react";
import { columns } from "./order-list-columns";
import { initQueryParams, QueryDataModel } from "@/types/model/app-model";

const OrderListPage = () => {
  const [orderList, setOrderList] = useState<OrderWithExtra[]>([]);
  const [queryParams, setQueryParams] =
    useState<QueryDataModel>(initQueryParams);

  useEffect(() => {
    getOrderList(initQueryParams);
  }, []);

  const getOrderList = async (params: QueryDataModel) => {
    const { data } = await apiGetOrderList(params);
    if (data.success) {
      setOrderList(data.data.orders ?? []);
      setQueryParams((prev) => ({
        ...prev,
        ...params,
        pagination: { ...params.pagination, totalCount: data.data.totalCount },
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

    await getOrderList(newData);
  };

  console.log(queryParams);

  return (
    <div>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Danh sách đơn hàng
      </h3>

      <div className="mt-4 overflow-x-auto">
        <DataTable
          columns={columns}
          data={orderList}
          manualPagination
          pagination={queryParams.pagination}
          onPaginationChange={onPaginationChange}
        />
      </div>
    </div>
  );
};

export default OrderListPage;
