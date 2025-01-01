import { DataTable } from "@/components/data-table/DataTable";
import { EnhancedColumnDef } from "@/components/data-table/dataTable.utils";
import { Button } from "@/components/ui/button";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import {
  apiCreateShippingStore,
  apiShippingStoresList,
} from "@/services/main/shipingStoreServices";
import {
  initQueryParams,
  QueryDataModel,
  ShippingStore,
} from "@/types/model/app-model";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, PlusCircle, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { schema } from "./panel/shipping-store-panel.schema";
import ShippingStorePanel, {
  ShippingStoreFormValues,
} from "./panel/ShippingStorePanel";

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
    cell: () => {
      return (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <Edit />
          </Button>
          <Button variant="outline" size="icon">
            <Trash className="text-red-500" />
          </Button>
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

  const onCreateShippingStore = async (data: ShippingStoreFormValues) => {
    await triggerLoading(async () => {
      await apiCreateShippingStore(data);
      toast.success("Tạo kho vận chuyển thành công.");
      await getShippingList(queryParams);
    });
  };

  useEffect(() => {
    triggerLoading(async () => {
      await getShippingList(initQueryParams);
    });
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
        />
      </div>

      <ShippingStorePanel
        isOpen={shippingPanel.isOpen}
        setIsOpen={(value) =>
          setShippingPanel((prev) => ({ ...prev, isOpen: value }))
        }
        onSubmit={onCreateShippingStore}
        form={shippingStoreForm}
      />
    </>
  );
};

export default ShippingStoreListPage;
