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
  excludeColumns?: string[];
  onEditClick?: (data: OrderWithExtra) => void;
  onDeleteClick?: (data: OrderWithExtra) => void;
}

const OrderTable: FC<OrderTableProps> = ({
  onStatusChange,
  onPaginationChange,
  onEditClick,
  onDeleteClick,
  orderList,
  queryParams,
  manualPagination = true,
  excludeColumns = [],
}) => {
  const columns = useGetOrderColumns({
    onStatusChange,
    excludeColumns,
    onEditClick,
    onDeleteClick,
  });

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
