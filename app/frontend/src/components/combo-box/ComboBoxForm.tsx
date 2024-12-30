import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  ControllerRenderProps,
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
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
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useState } from "react";

interface ComboBoxFormProps<TFormValue extends FieldValues> {
  options: Option[];
  name: Path<TFormValue>;
  form: UseFormReturn<TFormValue, A, undefined>;
  label: string;
  searchable?: boolean;
  emptyRender?: () => React.ReactNode;
  renderOption?: (option: Option) => React.ReactNode;
  onClickEmptyAction?: () => void;
}
const ComboBoxForm = <TFormValue extends FieldValues>({
  options,
  name,
  form,
  label,
  emptyRender,
  onClickEmptyAction,
  renderOption,
  searchable = true,
}: ComboBoxFormProps<TFormValue>) => {
  const [open, setOpen] = useState(false);

  const renderSelectedOption = (
    field: ControllerRenderProps<TFormValue, Path<TFormValue>>
  ) => {
    if (!field.value)
      return (
        <span className="text-[#ddd]">{`Chọn ${label?.toLocaleLowerCase()}`}</span>
      );
    const option = options.find((option) => option.value === field.value);

    if (renderOption && option) return renderOption(option);
    return option?.label;
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {renderSelectedOption(field)}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                {searchable && (
                  <CommandInput
                    placeholder={`Tìm kiếm ${label.toLocaleLowerCase()}...`}
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
                            {label.toLocaleLowerCase()} không tồn tại
                          </p>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={onClickEmptyAction}
                          >
                            Tạo {label.toLocaleLowerCase()}
                          </Button>
                        </>
                      )}
                    </CommandEmpty>
                  )}
                  <CommandGroup ref={field.ref}>
                    {options.map((option) => (
                      <CommandItem
                        value={option.label}
                        key={option.value}
                        disabled={option.disable}
                        onSelect={() => {
                          form.setValue(
                            name,
                            option.value as PathValue<
                              TFormValue,
                              Path<TFormValue>
                            >
                          );
                          setOpen(false);
                          form.trigger(name);
                        }}
                      >
                        {renderOption ? renderOption(option) : option.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            option.value === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ComboBoxForm;
