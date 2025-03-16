import { useCallback, useState } from "react";
import { toast } from "sonner";

type CopiedValue = string | null;

export type CopyFn = (
  text: string,
  succcessMessage?: string
) => Promise<boolean>;

export const useCopyToClipboard = (): [CopiedValue, CopyFn] => {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);

  const copy: CopyFn = useCallback(async (text, succcessMessage) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      toast.error("Thiết bị không hỗ trợ clipboard");

      return false;
    }

    // Try to save to clipboard then save it in the state if worked
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      if (succcessMessage) {
        toast.success(succcessMessage);
      }
      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      setCopiedText(null);
      toast.error("Có lỗi xảy ra");
      return false;
    }
  }, []);

  return [copiedText, copy];
};
