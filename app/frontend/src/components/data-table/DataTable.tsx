import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
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
import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { DataTablePagination } from "./DataTablePagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  manualPagination?: boolean;
  pagination?: { pageIndex: number; pageSize: number; totalCount: number };
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  showPagination?: boolean;
  meta?: A;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  onPaginationChange,
  manualPagination = false,
  showPagination = true,
  meta,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalPagination, setInternalPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 100, //default page size
  });

  let tableSettings: TableOptions<TData> = {
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setInternalPagination,
    manualPagination: manualPagination,
    state: { sorting, pagination: internalPagination },
    meta,
  };

  if (manualPagination) {
    tableSettings = {
      ...tableSettings,
      onPaginationChange: (updater) => {
        if (typeof updater !== "function") return;
        const nextState = updater(pagination as PaginationState);
        onPaginationChange?.(nextState.pageIndex, nextState.pageSize);
      },
      rowCount: pagination?.totalCount,
      state: {
        sorting,
        pagination,
      },
    };
  }

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
            <Card key={row.id}>
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
