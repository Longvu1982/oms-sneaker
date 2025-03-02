import { Textarea } from "@/components/ui/textarea";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import { apiUpdateTransaction } from "@/services/main/transactionServices";
import { TransactionWithExtra } from "@/types/model/app-model";
import { FC, useState } from "react";
import { toast } from "sonner";

interface EditableDescriptionProps {
  transaction: TransactionWithExtra;
  onReload?: () => Promise<void>;
}

export const EditableDescription: FC<EditableDescriptionProps> = ({
  transaction,
  onReload,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(transaction.description ?? "");
  const { triggerLoading } = useTriggerLoading();

  const onSave = () => {
    triggerLoading(async () => {
      await apiUpdateTransaction({
        id: transaction.id,
        description,
      });
      setIsEditing(false);
      toast.success("Cập nhật ghi chú thành công");
      onReload?.();
    });
  };

  const onCancel = () => {
    setDescription(transaction.description ?? "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="max-w-[100px]">
        <Textarea
          autoFocus
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={onCancel}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSave();
            }
            if (e.key === "Escape") {
              onCancel();
            }
          }}
          className="min-h-[60px] w-[200px]"
          placeholder="Nhập ghi chú..."
        />
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer truncate whitespace-pre-line"
      onClick={() => setIsEditing(true)}
    >
      {transaction.description ?? (
        <span className="italic opacity-50">Chưa có ghi chú</span>
      )}
    </div>
  );
};
