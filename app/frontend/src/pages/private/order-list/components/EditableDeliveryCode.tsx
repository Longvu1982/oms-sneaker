import { Input } from "@/components/ui/input";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import { renderBadge } from "@/lib/utils";
import { OrderWithExtra, apiUpdateOrder } from "@/services/main/orderServices";
import { DeliveryCodeStatus } from "@/types/enum/app-enum";
import { useState } from "react";
import { toast } from "sonner";
import { deliveryCodeStatusObject } from "../order-list-utils";
import { OrderFormValues } from "../panel/OrderPanel";

interface EditableDeliveryCodeProps {
  order: OrderWithExtra;
  onReload?: () => Promise<void>;
}

export const EditableDeliveryCode = ({
  order,
  onReload,
}: EditableDeliveryCodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(order.deliveryCode || "");
  const { triggerLoading } = useTriggerLoading();

  const handleSave = async () => {
    if (value === order.deliveryCode) {
      setIsEditing(false);
      return;
    }

    await triggerLoading(async () => {
      try {
        await apiUpdateOrder({
          id: order.id,
          deliveryCode: value,
          deliveryCodeStatus: value
            ? DeliveryCodeStatus.EXIST
            : DeliveryCodeStatus.PENDING,
        } as OrderFormValues);
        setIsEditing(false);
        toast.success("Cập nhật mã vận đơn thành công");
        if (onReload) {
          await onReload();
        }
      } catch (error) {
        console.error("Failed to update delivery code:", error);
        toast.error("Cập nhật mã vận đơn thất bại");
      }
    });
  };

  const handleCancel = () => {
    setValue(order.deliveryCode || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-[150px]"
        autoFocus
        onBlur={handleCancel}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
          } else if (e.key === "Escape") {
            handleCancel();
          }
        }}
      />
    );
  }

  const codeText = order.deliveryCode || "Chưa có MVĐ";
  return renderBadge(
    deliveryCodeStatusObject[order.deliveryCodeStatus]?.color,
    <div className="whitespace-nowrap flex" onClick={() => setIsEditing(true)}>
      {codeText}
      <span className="hidden md:block">
        {` : ${deliveryCodeStatusObject[order.deliveryCodeStatus]?.text}`}
      </span>
    </div>
  );
};
