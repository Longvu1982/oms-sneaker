import AvatarMenu from "@/components/avatar-menu/AvatarMenu";
import { BackToTop } from "@/components/back-to-top/BackToTop";
import GlobalModal from "@/components/global-modal/GlobalModal";
import MainSidebar from "@/components/main-sidebar/MainSidebar";
import { Spinner } from "@/components/spinner/Spinner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import useAuthStore from "@/store/auth";
import useMainStore from "@/store/main";
import { Suspense, useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Sticky from "react-sticky-el";
const ProtectedRoutes = () => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const ref = useRef<HTMLElement>(null);
  const setMainRef = useMainStore((state) => state.setMainRef);

  useEffect(() => {
    if (user) setMainRef(ref);
  }, [setMainRef, user]);

  return user ? (
    <SidebarProvider>
      <MainSidebar />
      <GlobalModal />
      <div className="flex-1 overflow-x-hidden">
        <div>
          <Sticky stickyClassName="z-[2]">
            <div className="h-12 shadow-sm flex items-center justify-between p-2 bg-background">
              <SidebarTrigger />
              <AvatarMenu />
            </div>
          </Sticky>
          <main
            ref={ref}
            id="main-app"
            className="p-4 overflow-y-auto h-[calc(100vh-48px)]"
          >
            <Suspense fallback={<Spinner />} key={location.key}>
              <Outlet />
            </Suspense>
            <div className="fixed bottom-6 right-4 flex flex-col gap-2">
              <BackToTop scrollContainerSelector="#main-app" />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoutes;
