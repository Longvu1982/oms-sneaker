import { useLoading } from "@/store/loading";
import { useErrorHandler } from "./use-error-handler";

function generateUniqueString(length = 16) {
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length);
}

export const useTriggerLoading = () => {
  const { closeLoading, showLoading } = useLoading();
  const { catchError } = useErrorHandler();

  const triggerLoading = async <T>(
    callback: () => Promise<T> | T,
    key?: string,
    isAll?: boolean
  ) => {
    const loadingKey = key ?? generateUniqueString();

    try {
      showLoading(loadingKey);
      return await callback();
    } catch (e: A) {
      catchError(e);
    } finally {
      closeLoading({ key: loadingKey, isAll });
    }
  };

  return { triggerLoading };
};
