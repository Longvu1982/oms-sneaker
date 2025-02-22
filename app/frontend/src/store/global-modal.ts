import { ReactNode, useCallback } from "react";
import { create } from "zustand";

type ModalType = "confirm" | "leave";

type ModalPropsType = {
  isOpen: boolean;
  type: ModalType;
  meta: {
    title: ReactNode;
    content: ReactNode;
    cancelText: string;
    confirmText: string;
    confirmType: "warning" | "alert" | "normal";
  };
  setOpen: (isOpen: boolean, type: ModalType) => void;
  onConfirm: ((closeModal: () => void) => void) | null;
  onCancel: () => void;
  setMeta: (
    meta: Partial<ModalPropsType["meta"]> & {
      onConfirm?: (closeModal: () => void) => void;
      onCancel?: () => void;
    }
  ) => void;
};

export const useGlobalModalStore = create<ModalPropsType>((set, get) => ({
  isOpen: false,
  type: "confirm",
  meta: {
    title: "Bạn có muốn thực hiện không?",
    content: "",
    cancelText: "Quay lại",
    confirmText: "Đồng ý",
    confirmType: "normal",
  },
  onConfirm: null,
  onCancel: () => set({ isOpen: false }),
  setOpen: (isOpen: boolean, type: ModalType) => set({ isOpen, type }),
  setMeta: ({
    onConfirm,
    onCancel,
    ...meta
  }: Partial<ModalPropsType["meta"]> & {
    onConfirm?: (closeModal: () => void) => void;
    onCancel?: () => void;
  }) => {
    set({
      meta: { ...get().meta, ...meta },
      onConfirm: onConfirm || null,
      ...(onCancel ? { onCancel } : {}),
    });
  },
}));

export const useGlobalModal = () => {
  const setOpen = useGlobalModalStore((state) => state.setOpen);
  const setMeta = useGlobalModalStore((state) => state.setMeta);

  const openConfirmModal = useCallback(
    (
      meta: Partial<ModalPropsType["meta"]> & {
        onConfirm?: (closeModal: () => void) => A;
        onCancel?: () => void;
      }
    ) => {
      setOpen(true, "confirm");
      setMeta(meta);
    },
    [setOpen, setMeta]
  );

  const openLeave = useCallback(
    (
      meta: Partial<ModalPropsType["meta"]> & {
        onCancel?: () => void;
      }
    ) => {
      setOpen(true, "leave");
      setMeta(meta);
    },
    [setOpen, setMeta]
  );

  return { openConfirmModal, openLeave };
};
