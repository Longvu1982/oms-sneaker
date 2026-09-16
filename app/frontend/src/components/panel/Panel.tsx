import { FC, ReactNode, isValidElement } from "react";
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
    <Drawer
      swipeDirection="right"
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          window.scrollTo(0, 0);
        }
        onOpenChange?.(isOpen);
      }}
      disablePointerDismissal
    >
      {trigger &&
        (isValidElement(trigger) ? (
          <DrawerTrigger render={trigger} />
        ) : (
          <DrawerTrigger>{trigger}</DrawerTrigger>
        ))}
      <DrawerContent className="w-[400px] rounded-none">
        <DrawerHeader className="flex flex-row items-start justify-between">
          <div className="space-y-2">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </div>
          <DrawerClose render={<Button variant="outline" size="icon" />}>
            <X />
          </DrawerClose>
        </DrawerHeader>
        <div className="overflow-y-auto flex-1">{children}</div>
        <DrawerFooter className="flex items-center flex-row justify-end">
          <DrawerClose render={<Button variant="outline" />}>
            Quay lại
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
