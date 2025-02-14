import UploadExcelOrders from "@/components/file-uploader/FileUploader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FC } from "react";

interface AddTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type AddTransferModalFormValues = {
  amount: number;
  createdAt: Date | null;
};

export const UploadOrderModal: FC<AddTransferModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload file (.xlsx .xls)</DialogTitle>
          <DialogDescription>
            Nhập thông tin để nạp tiền cho khách hàng
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <UploadExcelOrders />
        </div>
        <DialogFooter>
          <Button type="submit" form="addTransferModalForm">
            Áp dụng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
