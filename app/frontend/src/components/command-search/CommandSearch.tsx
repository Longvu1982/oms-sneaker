import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";

interface CommandSearchProps {
  value: string;
  onValueChange: (value: string) => void;
  onSearch: (value: string) => Promise<void>;
  title?: string;
  description?: string;
  placeholder?: string;
}

export function CommandSearch({
  value,
  onValueChange,
  onSearch,
  title,
  description,
  placeholder,
}: CommandSearchProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? "Tìm kiếm"}</DialogTitle>
          <DialogDescription>
            {description ?? "Nhập thông tin để tìm kiếm"}
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder={placeholder ?? "Tìm kiếm"}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              await onSearch(value);
              setOpen(false);
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
