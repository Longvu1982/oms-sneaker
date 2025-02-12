import { DataTable } from "@/components/data-table/DataTable";
import { EnhancedColumnDef } from "@/components/data-table/dataTable.utils";
import { Button } from "@/components/ui/button";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import {
  apiCreateShippingStore,
  apiShippingStoresList,
  apiUpdateShippingStore,
  ShippingStoreFormValues,
} from "@/services/main/shippingStoreServices";
import {
  initQueryParams,
  QueryDataModel,
  ShippingStore,
} from "@/types/model/app-model";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, PlusCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { schema } from "./panel/shipping-store-panel.schema";
import ShippingStorePanel from "./panel/ShippingStorePanel";

const columns: EnhancedColumnDef<ShippingStore>[] = [
  {
    id: "STT",
    header: "STT",
    cell: ({ row }) => {
      return <div>{row.index + 1}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Tên kho",
  },
  {
    accessorKey: "address",
    header: "Địa chỉ",
  },
  {
    accessorKey: "phone",
    header: "SĐT",
  },
  {
    id: "actions",
    fixed: true,
    cell: ({ row, table }) => {
      const onEditClick = (table.options.meta as A)?.onEditClick;
      return (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEditClick(row.original)}
          >
            <Edit />
          </Button>
          {/* <Button variant="outline" size="icon">
            <Trash className="text-red-500" />
          </Button> */}
        </div>
      );
    },
  },
];

const ShippingStoreListPage = () => {
  const [shippingStoreList, setShippingStoreList] = useState<ShippingStore[]>(
    []
  );
  const [shippingPanel, setShippingPanel] = useState<{
    isOpen: boolean;
    type: "create" | "edit";
  }>({ isOpen: false, type: "create" });
  const [queryParams, setQueryParams] =
    useState<QueryDataModel>(initQueryParams);

  const { triggerLoading } = useTriggerLoading();

  const shippingStoreForm = useForm<ShippingStoreFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
    },
  });

  const getShippingList = async (params: QueryDataModel) => {
    const { data } = await apiShippingStoresList(params);
    if (data.success) {
      setShippingStoreList(data.data.shippingStores ?? []);
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
      await getShippingList(newData);
    });
  };

  const onEditClick = useCallback(
    (data: ShippingStore) => {
      shippingStoreForm.reset({ ...data });
      setShippingPanel((prev) => ({ ...prev, isOpen: true, type: "edit" }));
    },
    [shippingStoreForm]
  );

  const onCreateUpdateShippingStore = async (data: ShippingStoreFormValues) => {
    await triggerLoading(async () => {
      const promise =
        shippingPanel.type === "create"
          ? apiCreateShippingStore
          : apiUpdateShippingStore;
      await promise(data);

      toast.success(
        shippingPanel.type === "create"
          ? "Tạo kho vận chuyển thành công"
          : "Chỉnh sửa thành công"
      );

      if (shippingPanel.type === "edit")
        setShippingPanel((prev) => ({ ...prev, isOpen: false }));

      await getShippingList(queryParams);
    });
  };

  useEffect(() => {
    triggerLoading(async () => {
      await getShippingList(initQueryParams);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
          Danh sách kho vận chuyển
        </h3>
      </div>

      <Button
        size="sm"
        className="mb-6"
        onClick={() => setShippingPanel((prev) => ({ ...prev, isOpen: true }))}
      >
        <PlusCircle /> Thêm kho
      </Button>

      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={shippingStoreList}
          manualPagination
          pagination={queryParams.pagination}
          onPaginationChange={onPaginationChange}
          meta={{ onEditClick }}
        />
      </div>

      <ShippingStorePanel
        panelState={shippingPanel}
        setIsOpen={(value) =>
          setShippingPanel((prev) => ({ ...prev, isOpen: value }))
        }
        onSubmit={onCreateUpdateShippingStore}
        form={shippingStoreForm}
      />
    </>
  );
};

export default ShippingStoreListPage;
