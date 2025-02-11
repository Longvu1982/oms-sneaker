import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [color, setColor] = useState(value);

  const handleChange = (newColor: string) => {
    setColor(newColor);
    onChange(newColor);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex w-full justify-start text-left font-normal"
        >
          <div
            className="w-4 h-4 rounded-full mr-2"
            style={{ backgroundColor: color }}
          />
          {color}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <Input
              type="color"
              value={color}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full h-10 cursor-pointer"
              wrapperClassname="flex-1"
            />
          </div>
          <Input
            type="text"
            value={color}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="#000000"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
