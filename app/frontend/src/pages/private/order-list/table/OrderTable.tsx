import { DataTable } from "@/components/data-table/DataTable";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { OrderWithExtra } from "@/services/main/orderServices";
import { OrderStatus } from "@/types/enum/app-enum";
import { QueryDataModel } from "@/types/model/app-model";
import { RowSelectionState } from "@tanstack/react-table";
import { FC, memo } from "react";
import { ViewportListRef } from "react-viewport-list";
import { useGetOrderColumns } from "../order-list-columns";

interface OrderTableProps {
  orderList: OrderWithExtra[];
  queryParams?: QueryDataModel;
  onStatusChange?: (id: string, status: OrderStatus) => Promise<A>;
  onPaginationChange?: (pagination: {
    pageIndex: number;
    pageSize: number;
  }) => void;
  manualPagination?: boolean;
  excludeColumns?: string[];
  onEditClick?: (data: OrderWithExtra) => void;
  onDeleteClick?: (data: OrderWithExtra) => void;
  selectedRows?: RowSelectionState;
  onRowSelectionChange?: (newSelection: RowSelectionState) => void;
  onReload?: () => Promise<void>;
  onChangeOrderCheckBox?: (id: string, checked: boolean) => void;
  showPagination?: boolean;
  viewportRef?: React.RefObject<ViewportListRef>;
}

const OrderTable: FC<OrderTableProps> = ({
  onStatusChange,
  onPaginationChange,
  onEditClick,
  onDeleteClick,
  orderList,
  queryParams,
  selectedRows,
  onRowSelectionChange,
  manualPagination = true,
  excludeColumns = [],
  onReload,
  onChangeOrderCheckBox,
  viewportRef,
  showPagination = true,
}) => {
  const columns = useGetOrderColumns({
    onStatusChange,
    excludeColumns,
    onEditClick,
    onDeleteClick,
    onReload,
  });

  const [, copyToClipBoard] = useCopyToClipboard();

  return (
    <div>
      <DataTable
        viewportRef={viewportRef}
        columns={columns}
        data={orderList}
        manualPagination={manualPagination}
        pagination={queryParams?.pagination}
        selectedRows={selectedRows}
        onRowSelectionChange={onRowSelectionChange}
        onPaginationChange={onPaginationChange}
        meta={{ onChangeOrderCheckBox, copyToClipBoard }}
        showPagination={showPagination}
      />
    </div>
  );
};

export default memo(OrderTable);
