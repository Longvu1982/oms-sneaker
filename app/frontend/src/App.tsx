import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { useRouter } from "./router/useRouter";
import { apiAuthMe } from "./services/main/authenServices";
import useAuthStore from "./store/auth";
import { Toaster } from "./components/ui/sonner";
import { useTriggerLoading } from "./hooks/use-trigger-loading";
import { useLoading } from "./store/loading";
import { Spinner } from "./components/spinner/Spinner";
import { ThemeProvider } from "./components/theme/ThemeProvider";

function App() {
  const { router } = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const { triggerLoading } = useTriggerLoading();
  const { isLoading: isGlobalLoading } = useLoading();

  useEffect(() => {
    triggerLoading(async () => {
      try {
        const { data } = await apiAuthMe();
        if (data.success) {
          setUser(data.data);
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="viet-deli-ui-theme">
      {isLoading && (
        <div className="fixed inset-0 z-[10000] bg-background">
          Authenticating...
        </div>
      )}
      <RouterProvider router={router} />
      <Toaster duration={2000} position="top-center" />
      {isGlobalLoading && <Spinner />}
    </ThemeProvider>
  );
}

export default App;
