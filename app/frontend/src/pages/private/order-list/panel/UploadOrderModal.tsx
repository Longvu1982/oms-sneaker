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
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import {
  apiBulkCreateOrder,
  apiCheckUserNamesExist,
} from "@/services/main/orderServices";
import { apiBulkCreateUser } from "@/services/main/userServices";
import { useGlobalModal } from "@/store/global-modal";
import { DeliveryCodeStatus, OrderStatus } from "@/types/enum/app-enum";
import { orderStatusOptions } from "@/types/model/app-model";
import { addHours } from "date-fns";
import { saveAs } from "file-saver";
import { AlertTriangle, Download, Info } from "lucide-react";
import { FC, useState } from "react";
import { toast } from "sonner";

interface AddTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getList: () => Promise<A>;
}

export type AddTransferModalFormValues = {
  amount: number;
  createdAt: Date | null;
};

const dataMapper = (rowData: A[]) => {
  if (!rowData) return [];

  return rowData.slice(1)?.map((row) => ({
    orderDate: addHours(row[0], 1),
    SKU: row[1] ?? "", // SKU
    size: row[2] != null ? String(row[2]) : "", // Size
    deposit: parseFloat(row[3]) ?? 0, // Cọc
    totalPrice: parseFloat(row[4]) ?? 0, // Giá
    userName: row[5], // Tên khách (we will convert to userId)
    orderNumber: row[6] != null ? String(row[6]) : "", // Order Number
    deliveryCode: row[7] != null ? String(row[7]) : "", // MVĐ
    checkBox: typeof row[8] === "boolean" ? row[8] : row[8] === "TRUE", // Hộp kiểm
    sourceName: row[9], // Nguồn (we will convert to sourceId)
    shippingFee: parseFloat(row[10]) ?? 0, // Cước vận chuyển 1
    secondShippingFee: parseFloat(row[11]) ?? 0, // Cước vận chuyển 1
    shippingStoreName: row[12], // Kho vận chuyển (we will convert to shippingStoreId)
    deliveryCodeStatus: row[7]
      ? DeliveryCodeStatus.EXIST
      : DeliveryCodeStatus.PENDING,
    status:
      orderStatusOptions.find((item) =>
        item.label.toLocaleLowerCase().includes(row[13]?.toLocaleLowerCase())
      )?.value ?? OrderStatus.ONGOING, // Trạng thái
  }));
};

export const UploadOrderModal: FC<AddTransferModalProps> = ({
  open,
  onOpenChange,
  getList,
}) => {
  const [fileData, setFileData] = useState<ReturnType<typeof dataMapper>>([]);
  const [file, setFile] = useState<File | null>(null);
  const { triggerLoading } = useTriggerLoading();
  const { openConfirmModal } = useGlobalModal();

  const onSubmit = async () => {
    await triggerLoading(async () => {
      const userNameList = fileData.map((item) => item.userName) as string[];
      const uniqueList = Array.from(new Set(userNameList));

      const emptyListIndex = userNameList.reduce((acc, item, index) => {
        if (!item?.trim()) {
          acc.push(index + 2);
        }
        return acc;
      }, [] as number[]);

      if (emptyListIndex.length > 0) {
        toast.error(
          <div>
            <p>Tên người dùng không được để trống</p>
            <p>Kiểm tra dòng {emptyListIndex.join(", ")}</p>
          </div>
        );
        return;
      }

      const { data } = await apiCheckUserNamesExist({
        names: uniqueList,
      });
      const missingNames = data.data;
      if (missingNames.length) {
        openConfirmModal({
          title: "Người dùng không tồn tại",
          content: (
            <div>
              <p>
                Người dùng{" "}
                <strong className="text-red-500">
                  {missingNames.join(", ")}
                </strong>{" "}
                không tồn tại
              </p>
              Bạn có muốn tạo người dùng này không?
              <div className="flex items-center gap-1 mt-4 italic">
                <AlertTriangle size={16} className="text-yellow-600" /> Vui lòng
                kiểm tra kĩ chính tả trước khi tạo người dùng mới
              </div>
            </div>
          ),
          cancelText: "Đổi file Excel",
          confirmText: "Tạo",
          onConfirm: async (closeModal) => {
            await triggerLoading(async () => {
              const { data } = await apiBulkCreateUser({
                names: missingNames,
              });

              if (!data.success) {
                return;
              }
              toast.success("Tạo người dùng thành công");
              closeModal();

              await new Promise((res) => setTimeout(res, 1000));

              const { data: createData } = await apiBulkCreateOrder({
                orders: fileData as A,
              });
              if (createData.success) {
                toast.success("Tạo danh sách đơn hàng thành công");
                closeModal();
                onOpenChange(false);
                await getList();
              }
            });
          },
        });
      } else {
        const { data: createData } = await apiBulkCreateOrder({
          orders: fileData as A,
        });
        if (createData.success) {
          toast.success("Tạo danh sách đơn hàng thành công");
          onOpenChange(false);
          await getList();
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload file (.xlsx .xls)</DialogTitle>
          <DialogDescription>
            Tải lên file theo chuẩn format để upload nhiều Order
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 text-gray-500">
          <Info size={16} className="text-blue-500" />
          Tải về template
          <Button
            variant="ghost"
            onClick={() => {
              const fileUrl = "/Template-with-second-ship.xlsx";
              saveAs(fileUrl, "Template.xlsx");
            }}
          >
            <Download />
            Template.xlsx
          </Button>
        </div>
        <div className="grid gap-4 py-4">
          <UploadExcelOrders
            file={file}
            setFile={setFile}
            fileData={fileData}
            setFileData={setFileData}
            mapper={dataMapper}
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            form="addTransferModalForm"
            onClick={onSubmit}
            disabled={!file || !fileData}
          >
            Áp dụng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
