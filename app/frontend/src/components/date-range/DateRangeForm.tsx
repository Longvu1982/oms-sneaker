import { cn } from "@/lib/utils";
import { CalendarIcon, X } from "lucide-react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { renderSelectedDateRange } from "./date.utils";

interface DateRangeFormProps<TFormValue extends FieldValues> {
  name: Path<TFormValue>;
  form: UseFormReturn<TFormValue, A, undefined>;
  label: string;
}

const DateRangeForm = <TFormValue extends FieldValues>({
  form,
  name,
  label,
}: DateRangeFormProps<TFormValue>) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <div className="flex items-center gap-2">
              <PopoverTrigger asChild className="flex-1">
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {renderSelectedDateRange(field.value)}

                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              {field.value && (
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  className="size-6"
                  onClick={() => {
                    form.setValue(name, null as A);
                  }}
                >
                  <X />
                </Button>
              )}
            </div>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={field.value?.from}
                selected={field.value}
                onSelect={field.onChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />
  );
};

export default DateRangeForm;
