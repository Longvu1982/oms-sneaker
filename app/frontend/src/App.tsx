import { Suspense, useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { useRouter } from "./router/useRouter";
import { apiAuthMe } from "./services/main/AuthServices";
import useAuthStore from "./store/auth";

function App() {
  const { router } = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiAuthMe();
        if (data.success) {
          setUser(data.data);
        } else {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return "Loading...";

  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          loading
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
