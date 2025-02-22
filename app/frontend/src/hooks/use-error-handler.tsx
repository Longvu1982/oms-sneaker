import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const useErrorHandler = () => {
  const catchError = (error: A) => {
    let message = error?.response?.data?.error?.message;
    if (typeof message === "object") message = "Lỗi bất định hoặc lỗi server";

    message = message ?? error?.message;

    toast.error("Có lỗi xảy ra!", {
      icon: <AlertTriangle className="text-orange-600 mr-2" size={20} />,
      description: message,
      duration: 2000,
    });
  };

  return { catchError };
};
