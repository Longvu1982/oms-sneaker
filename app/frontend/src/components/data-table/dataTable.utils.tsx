import { ColumnDef } from "@tanstack/react-table";

export type EnhancedColumnDef<T> = ColumnDef<T> & { fixed?: boolean };
