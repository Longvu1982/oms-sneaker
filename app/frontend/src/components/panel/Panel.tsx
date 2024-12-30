import { FC, ReactNode } from "react";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { X } from "lucide-react";

interface PanelProps {
  open?: boolean;
  formId?: string;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  children: ReactNode;
  title: string;
  description?: string;
}
const Panel: FC<PanelProps> = ({
  open,
  onOpenChange,
  trigger,
  children,
  formId,
  title,
  description,
}) => {
  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger>{trigger}</DrawerTrigger>}
      <DrawerContent
        onInteractOutside={(e) => e.preventDefault()}
        className="h-full w-[400px] right-0 rounded-t-none"
      >
        <DrawerHeader className="flex items-start justify-between">
          <div className="space-y-2">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="outline" size="icon">
              <X />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="overflow-y-auto flex-1">{children}</div>
        <DrawerFooter className="flex items-center flex-row justify-end">
          <DrawerClose asChild>
            <Button variant="outline">Quay lại</Button>
          </DrawerClose>
          <Button form={formId} type="submit">
            Áp dụng
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default Panel;
