import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Option } from "../multi-select/MutipleSelect";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface ComboBoxProps {
  options: Option[];
  label?: string;
  searchable?: boolean;
  emptyRender?: () => React.ReactNode;
  renderOption?: (option: Option) => React.ReactNode;
  onClickEmptyAction?: () => void;
  value: Option["value"];
  triggerClassName?: string;
  onValueChange?: (value: Option["value"]) => void;
  disabled?: boolean;
}
const ComboBox = ({
  options,
  label,
  emptyRender,
  onClickEmptyAction,
  renderOption,
  value,
  onValueChange,
  triggerClassName,
  disabled,
  searchable = true,
}: ComboBoxProps) => {
  const [open, setOpen] = useState(false);

  const renderSelectedOption = () => {
    if (!value)
      return (
        <span className="text-[#ddd]">{`Chọn ${label?.toLocaleLowerCase()}`}</span>
      );
    const option = options.find((option) => option.value === value);

    if (renderOption && option) return renderOption(option);
    return option?.label;
  };

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        if (disabled) return;
        setOpen(open);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          className={cn(
            "justify-between",
            !value && "text-muted-foreground",
            triggerClassName
          )}
        >
          {renderSelectedOption()}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[200px]">
        <Command value={value}>
          {searchable && (
            <CommandInput
              placeholder={`Tìm kiếm ${label?.toLocaleLowerCase()}...`}
              className="h-9"
            />
          )}
          <CommandList>
            {searchable && (
              <CommandEmpty>
                {emptyRender ? (
                  emptyRender()
                ) : (
                  <>
                    <p className="mb-4">
                      {label?.toLocaleLowerCase()} không tồn tại
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onClickEmptyAction}
                    >
                      Tạo {label?.toLocaleLowerCase()}
                    </Button>
                  </>
                )}
              </CommandEmpty>
            )}
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  value={option.value}
                  key={option.value}
                  disabled={option.disable}
                  onSelect={onValueChange}
                  className="hover:bg-accent cursor-pointer"
                >
                  {renderOption ? renderOption(option) : option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      option.value === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ComboBox;
