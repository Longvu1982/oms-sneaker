import { DataTable } from "@/components/data-table/DataTable";
import { OrderWithExtra } from "@/services/main/orderServices";
import { OrderStatus } from "@/types/enum/app-enum";
import { QueryDataModel } from "@/types/model/app-model";
import { FC } from "react";
import { useGetOrderColumns } from "../order-list-columns";

interface OrderTableProps {
  orderList: OrderWithExtra[];
  queryParams?: QueryDataModel;
  onStatusChange?: (id: string, status: OrderStatus) => Promise<A>;
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  manualPagination?: boolean;
}

const OrderTable: FC<OrderTableProps> = ({
  onStatusChange,
  onPaginationChange,
  orderList,
  queryParams,
  manualPagination = true,
}) => {
  const columns = useGetOrderColumns({ onStatusChange });

  return (
    <div>
      <DataTable
        columns={columns}
        data={orderList}
        manualPagination={manualPagination}
        pagination={queryParams?.pagination}
        onPaginationChange={onPaginationChange}
      />
    </div>
  );
};

export default OrderTable;
