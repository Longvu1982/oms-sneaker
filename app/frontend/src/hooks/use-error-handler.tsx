import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const useErrorHandler = () => {
  const catchError = (error: A) => {
    const apiMessage = error?.response?.data?.error?.message ?? error.message;
    toast.error("Có lỗi xảy ra!", {
      icon: <AlertTriangle className="text-orange-600 mr-2" size={20} />,
      description: apiMessage,
      duration: 2000,
    });
  };

  return { catchError };
};
