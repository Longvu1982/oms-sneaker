import { DataTable } from "@/components/data-table/DataTable";
import { EnhancedColumnDef } from "@/components/data-table/dataTable.utils";
import { Button } from "@/components/ui/button";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import {
  apiCreateSource,
  apiSourcesList,
} from "@/services/main/sourceServices";
import {
  initQueryParams,
  QueryDataModel,
  Source,
} from "@/types/model/app-model";
import { Edit, PlusCircle, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import SourcePanel, { SourceFormValues } from "./panel/SourcePanel";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "./panel/source-panel-scheme";

const columns: EnhancedColumnDef<Source>[] = [
  {
    id: "STT",
    header: "STT",
    cell: ({ row }) => {
      return <div>{row.index + 1}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Tên nguồn",
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

const SourceListPage = () => {
  const [sourceList, setSourceList] = useState<Source[]>([]);
  const [sourcePanel, setSourcePanel] = useState<{
    isOpen: boolean;
    type: "create" | "edit";
  }>({ isOpen: false, type: "create" });
  const [queryParams, setQueryParams] =
    useState<QueryDataModel>(initQueryParams);

  const { triggerLoading } = useTriggerLoading();

  const sourceForm = useForm<SourceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
    },
  });

  const getSourceList = async (params: QueryDataModel) => {
    const { data } = await apiSourcesList(params);
    if (data.success) {
      setSourceList(data.data.sources ?? []);
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
      await getSourceList(newData);
    });
  };

  const onCreateSource = async (data: SourceFormValues) => {
    await triggerLoading(async () => {
      await apiCreateSource(data);
      toast.success("Tạo nguồn hàng thành công.");
      await getSourceList(queryParams);
    });
  };

  useEffect(() => {
    triggerLoading(async () => {
      await getSourceList(initQueryParams);
    });
  }, []);

  return (
    <>
      <div>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
          Danh sách nguồn
        </h3>
      </div>

      <Button
        size="sm"
        className="mb-6"
        onClick={() => setSourcePanel((prev) => ({ ...prev, isOpen: true }))}
      >
        <PlusCircle /> Thêm nguồn hàng
      </Button>

      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={sourceList}
          manualPagination
          pagination={queryParams.pagination}
          onPaginationChange={onPaginationChange}
        />
      </div>

      <SourcePanel
        isOpen={sourcePanel.isOpen}
        setIsOpen={(value) =>
          setSourcePanel((prev) => ({ ...prev, isOpen: value }))
        }
        onSubmit={onCreateSource}
        form={sourceForm}
      />
    </>
  );
};

export default SourceListPage;
