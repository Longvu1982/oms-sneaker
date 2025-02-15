import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useGlobalModalStore } from "@/store/global-modal";

export default function GlobalModal() {
  const meta = useGlobalModalStore((state) => state.meta);
  const isOpen = useGlobalModalStore((state) => state.isOpen);
  const modalType = useGlobalModalStore((state) => state.type);
  const setOpen = useGlobalModalStore((state) => state.setOpen);
  const onCancel = useGlobalModalStore((state) => state.onCancel);
  const onConfirm = useGlobalModalStore((state) => state.onConfirm);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{meta.title}</AlertDialogTitle>
          {/* <AlertDialogDescription>{meta.content}</AlertDialogDescription> */}
        </AlertDialogHeader>
        <div className="text-gray-500">{meta.content}</div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {meta.cancelText}
          </AlertDialogCancel>
          {modalType === "confirm" && (
            <AlertDialogAction
              onClick={() => onConfirm?.(() => setOpen(false, modalType))}
              className={cn(
                meta.confirmType === "warning" && "bg-yellow-500",
                meta.confirmType === "alert" && "bg-red-600"
              )}
            >
              {meta.confirmText}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
