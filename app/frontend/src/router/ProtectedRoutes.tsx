import AvatarMenu from "@/components/avatar-menu/AvatarMenu";
import { BackToTop } from "@/components/back-to-top/BackToTop";
import GlobalModal from "@/components/global-modal/GlobalModal";
import MainSidebar from "@/components/main-sidebar/MainSidebar";
import { Spinner } from "@/components/spinner/Spinner";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import {
  apiExportDatabase,
  apiGetLastBackupTime,
} from "@/services/main/databaseServices";
import useAuthStore from "@/store/auth";
import useMainStore from "@/store/main";
import { Role } from "@/types/enum/app-enum";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import { DatabaseBackup } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Sticky from "react-sticky-el";

const ProtectedRoutes = () => {
  const [lastBackupTime, setLastBackupTime] = useState<string>("");
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const { triggerLoading } = useTriggerLoading();

  const ref = useRef<HTMLElement>(null);
  const setMainRef = useMainStore((state) => state.setMainRef);

  const getLastBackupTime = async () => {
    const { data } = await apiGetLastBackupTime();
    if (data.success) {
      setLastBackupTime(data.data.createdAt);
    }
  };

  useEffect(() => {
    if (user) setMainRef(ref);
  }, [setMainRef, user]);

  useEffect(() => {
    getLastBackupTime();
  }, []);

  return user ? (
    <SidebarProvider>
      <MainSidebar />
      <GlobalModal />
      <div className="flex-1 overflow-x-hidden">
        <div>
          <Sticky stickyClassName="z-[2]">
            <div className="h-12 shadow-sm flex items-center justify-between p-2 bg-background">
              <SidebarTrigger />
              <div className="flex gap-2 items-center">
                <ThemeToggle />
                {user.account.role === Role.ADMIN && (
                  <>
                    <div className="flex flex-col items-center">
                      <p className="text-xs italic">Lần backup cuối</p>
                      <p className="text-sm">
                        {lastBackupTime
                          ? format(lastBackupTime, "dd/MM/yyyy")
                          : "N/A"}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        triggerLoading(async () => {
                          const { data } = await apiExportDatabase();
                          const blob = new Blob([data]);
                          saveAs(
                            blob,
                            `database_backup_${format(
                              new Date(),
                              "yyyy-MM-dd_HH-mm-ss"
                            )}.json.gz`
                          );
                          await getLastBackupTime();
                        })
                      }
                    >
                      <DatabaseBackup />
                    </Button>
                  </>
                )}
                <AvatarMenu />
              </div>
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
