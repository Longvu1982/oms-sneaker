import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table";

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { DataTablePagination } from "./DataTablePagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  manualPagination?: boolean;
  pagination?: { pageIndex: number; pageSize: number; totalCount: number };
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  showPagination?: boolean;
  selectedRows?: RowSelectionState;
  onRowSelectionChange?: (newSelection: RowSelectionState) => void;
  meta?: A;
}
interface DefaultData {
  id?: string;
}

export function DataTable<TData extends DefaultData, TValue>({
  columns,
  data,
  pagination: externalPagination,
  onPaginationChange,
  manualPagination = false,
  showPagination = true,
  selectedRows: externalSelectedRows,
  onRowSelectionChange,
  meta,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalPagination, setInternalPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 100, //default page size
    totalCount: undefined,
  });

  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>({});

  const pagination = manualPagination ? externalPagination : internalPagination;
  const setPagination = manualPagination
    ? onPaginationChange
    : setInternalPagination;

  const rowSelection = externalSelectedRows ?? internalRowSelection;
  const setRowSelection = onRowSelectionChange ?? setInternalRowSelection;

  const refinedColumns: ColumnDef<TData, TValue>[] = useMemo(() => {
    if (externalSelectedRows)
      return [
        {
          id: "select",
          header: ({ table }) => {
            let checked: boolean | "indeterminate" =
              table.getIsAllPageRowsSelected();
            if (table.getIsSomePageRowsSelected()) checked = "indeterminate";

            return (
              <Checkbox
                checked={checked}
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
              />
            );
          },
          cell: ({ row }) => (
            <div className="w-[35px]">
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />
            </div>
          ),
        },
        ...columns,
      ];

    return columns;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!externalSelectedRows, columns]);

  const tableSettings: TableOptions<TData> = {
    data,
    columns: refinedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination as A,
    onRowSelectionChange: setRowSelection as A,
    manualPagination,
    rowCount: pagination?.totalCount,
    state: {
      sorting,
      rowSelection,
      pagination,
    },
    getRowId: (row) => row.id as string,
    meta,
  };

  const table = useReactTable(tableSettings);

  if (!table.getRowModel().rows?.length)
    return <p className="text-left">Không có dữ liệu</p>;

  return (
    <div className="">
      <div className="rounded-md border hidden md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const fixed = (header.column.columnDef as A).fixed as boolean;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "border-l-[1px] border-r-[1px]",
                        fixed
                          ? "sticky right-0 bg-background shadow-md shadow-black hover:bg-muted/50"
                          : ""
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const fixed = (cell.column.columnDef as A)
                        .fixed as boolean;
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "border-l-[1px] border-r-[1px]",
                            fixed
                              ? "sticky right-0 bg-background shadow-md"
                              : ""
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-4">
        {table.getRowModel().rows.map((row) => {
          const headers = table.getHeaderGroups()?.[0]?.headers ?? [];

          return (
            <Card key={row.id} className="shadow-md border-[1px] border-black">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {row.getVisibleCells().map((cell) => {
                    const header = headers.find(
                      (item) => item.id === cell.column.id
                    );
                    return (
                      <div key={cell.id} className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          {header?.isPlaceholder
                            ? null
                            : flexRender(
                                header?.column.columnDef.header,
                                header?.getContext?.() as A
                              )}
                        </p>
                        <div className="text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        {showPagination && <DataTablePagination table={table} />}
      </div>
    </div>
  );
}
