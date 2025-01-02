import { toast } from "sonner";

export const useErrorHandler = () => {
  const catchError = (error: A) => {
    toast.error("Có lỗi xảy ra!", {
      description: error.message,
    });
  };

  return { catchError };
};
