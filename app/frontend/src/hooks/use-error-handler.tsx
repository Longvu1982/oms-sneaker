import { toast } from "sonner";

export const useErrorHandler = () => {
  const catchError = (error: A) => {
    console.log(error);
    toast.error("Có lỗi xảy ra!", {
      description: error.message,
    });
  };

  return { catchError };
};
