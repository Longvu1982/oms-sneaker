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
    // Navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(succcessMessage);
        setCopiedText(text);
        return true;
      } catch {
        toast.error("Có lỗi xảy ra hoặc thiết bị không hỗ trợ Clipboard");
        return false;
      }
    } else {
      // Use the 'out of viewport hidden text area' trick
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Move textarea out of the viewport so it's not visible
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";

      document.body.prepend(textArea);
      textArea.select();

      try {
        document.execCommand("copy");
        toast.success(succcessMessage);
        setCopiedText(text);
        return true;
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi xảy ra hoặc thiết bị không hỗ trợ Clipboard");
        return false;
      } finally {
        textArea.remove();
      }
    }
  }, []);

  return [copiedText, copy];
};
