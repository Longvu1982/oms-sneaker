import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CommandSearchProps {
  value: string;
  onValueChange: (value: string) => void;
  onSearch?: (value: string) => Promise<void>;
  title?: string;
  description?: string;
  placeholder?: string;
  /* list of search IDs
   */
  results: string[];
  onChangeResult?: (result: string, type: "next" | "prev") => void;
}

export function CommandSearch({
  value,
  onValueChange,
  onSearch,
  title,
  description,
  placeholder,
  results,
  onChangeResult,
}: CommandSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>();

  const currentIndex = selected ? results.indexOf(selected) : 0;

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
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogContent
        className="top-20"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title ?? "Tìm kiếm"}</DialogTitle>
          <DialogDescription>
            {description ?? "Nhập thông tin để tìm kiếm"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder={placeholder ?? "Tìm kiếm"}
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  await onSearch?.(value);
                }
              }}
            />
            <div className="absolute top-1/2 right-3 -translate-y-1/2">
              {currentIndex + 1}/{results.length}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                const nextIndex =
                  currentIndex === 0 ? results.length - 1 : currentIndex - 1;
                setSelected(results[nextIndex]);
                onChangeResult?.(results[nextIndex], "prev");
              }}
            >
              <ChevronUp />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                const nextIndex =
                  currentIndex === results.length - 1 ? 0 : currentIndex + 1;
                setSelected(results[nextIndex]);
                onChangeResult?.(results[nextIndex], "next");
              }}
            >
              <ChevronDown />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
