import MainSidebar from "@/components/main-sidebar/MainSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import useAuthStore from "@/store/auth";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoutes = () => {
  const user = useAuthStore((s) => s.user);

  return user ? (
    <SidebarProvider>
      <MainSidebar />
      <div>
        <div className="h-12 sticky top-0 shadow-sm flex items-center p-2 bg-background">
          <SidebarTrigger />
        </div>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoutes;
