import { DataTable } from "@/components/data-table/DataTable";
import { EnhancedColumnDef } from "@/components/data-table/dataTable.utils";
import { Button } from "@/components/ui/button";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import { renderBadge } from "@/lib/utils";
import {
  apiCreateSource,
  apiSourcesList,
  apiUpdateSource,
} from "@/services/main/sourceServices";
import {
  initQueryParams,
  QueryDataModel,
  Source,
} from "@/types/model/app-model";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, PlusCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { schema } from "./panel/source-panel-scheme";
import SourcePanel, { SourceFormValues } from "./panel/SourcePanel";

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
    cell: ({ row }) => renderBadge(row.original.color, row.original.name),
  },
  {
    id: "actions",
    fixed: true,
    cell: ({ table, row }) => {
      const onClickEditSource = table.options.meta?.onClickEditSource;

      return (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onClickEditSource?.(row.original)}
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

const SourceListPage = () => {
  const [sourceList, setSourceList] = useState<Source[]>([]);
  const [sourcePanel, setSourcePanel] = useState<{
    isOpen: boolean;
    type: "create" | "edit";
    data: SourceFormValues;
  }>({ isOpen: false, type: "create", data: {} as SourceFormValues });
  const [queryParams, setQueryParams] =
    useState<QueryDataModel>(initQueryParams);

  const { triggerLoading } = useTriggerLoading();

  const sourceForm = useForm<SourceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      color: "#000000",
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

  const onClickEditSource = useCallback(
    (data: Source) => {
      sourceForm.reset({ ...data });
      setSourcePanel((prev) => ({ ...prev, isOpen: true, type: "edit" }));
    },
    [sourceForm]
  );

  const onCreateUpdateSource = async (data: SourceFormValues) => {
    await triggerLoading(async () => {
      const promise =
        sourcePanel.type === "create" ? apiCreateSource : apiUpdateSource;
      await promise(data);

      toast.success(
        sourcePanel.type === "create"
          ? "Tạo nguồn hàng thành công"
          : "Chỉnh sửa thành công"
      );
      if (sourcePanel.type === "edit")
        setSourcePanel((prev) => ({ ...prev, isOpen: false }));

      await getSourceList(queryParams);
    });
  };

  useEffect(() => {
    triggerLoading(async () => {
      await getSourceList(initQueryParams);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          meta={{ onClickEditSource }}
        />
      </div>

      <SourcePanel
        panelState={sourcePanel}
        setIsOpen={(value) =>
          setSourcePanel((prev) => ({ ...prev, isOpen: value }))
        }
        onSubmit={onCreateUpdateSource}
        form={sourceForm}
      />
    </>
  );
};

export default SourceListPage;
