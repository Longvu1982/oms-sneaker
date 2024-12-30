import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center space-y-6 max-w-md px-4">
        {/* Custom 404 illustration */}
        <div className="relative w-64 h-64 mx-auto">
          <div className="absolute inset-0 bg-blue-500 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute inset-4 bg-blue-500 rounded-full opacity-20 animate-pulse delay-75"></div>
          <div className="absolute inset-8 bg-blue-500 rounded-full opacity-30 animate-pulse delay-150"></div>
          <div className="absolute inset-16 flex items-center justify-center">
            <span className="text-7xl font-bold text-blue-500">404</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Trang không tồn tại
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Trang tìm kiếm không tồn tại hoặc bạn không có quyền xem trang này!
        </p>
        <Button className="mt-4" onClick={() => navigate("/")}>
          Về trang chính
        </Button>
      </div>
    </div>
  );
}
