import AvatarMenu from "@/components/avatar-menu/AvatarMenu";
import MainSidebar from "@/components/main-sidebar/MainSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import useAuthStore from "@/store/auth";
import { Navigate, Outlet } from "react-router-dom";
import Sticky from "react-sticky-el";
const ProtectedRoutes = () => {
  const user = useAuthStore((s) => s.user);

  return user ? (
    <SidebarProvider>
      <MainSidebar />
      <div className="flex-1 overflow-x-hidden">
        <div>
          <Sticky stickyClassName="z-[2]">
            <div className="h-12 shadow-sm flex items-center justify-between p-2 bg-background">
              <SidebarTrigger />
              <AvatarMenu />
            </div>
          </Sticky>
          <main className="p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoutes;
