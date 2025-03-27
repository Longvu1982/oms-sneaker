import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
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
  const inputRef = React.useRef<HTMLInputElement>(null);

  const currentIndex = selected ? results.indexOf(selected) : -1;

  const onUpclick = () => {
    if (currentIndex > 0) {
      setSelected(results[currentIndex - 1]);
      onChangeResult?.(results[currentIndex - 1], "prev");
    }
    else {
      setSelected(results[results.length - 1]);
      onChangeResult?.(results[results.length - 1], "prev");
    }
  };

  const onDownclick = () => {
    if (currentIndex < results.length - 1) {
      setSelected(results[currentIndex + 1]);
      onChangeResult?.(results[currentIndex + 1], "next");
    }
    else {
      setSelected(results[0]);
      onChangeResult?.(results[0], "next");
    }
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (open) {
          inputRef.current?.focus();
          inputRef.current?.select();
        } else {
          setOpen(true);
        }
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  useEffect(() => {
    setSelected(undefined);
  }, [value]);

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
              ref={inputRef}
              placeholder={placeholder ?? "Tìm kiếm"}
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  await onSearch?.(value);
                  onDownclick()
                }
                else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  onUpclick();
                }
                else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  onDownclick();
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
              onClick={onUpclick}
            >
              <ChevronUp />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onDownclick}
            >
              <ChevronDown />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
