import { createBrowserRouter } from "react-router-dom";
import { route1Route } from "./routes/route1.routes";
import { Home, Login, ProtectedRoutes } from "./routeLoader";
import { orderRoutes } from "./routes/order.routes";
import useAuthStore from "@/store/auth";
import NotFound from "@/pages/public/not-found/404";
import { sourceRoutes } from "./routes/sources.routers";
import { shippingStoreRoutes } from "./routes/shippingStores.routers";
import { userRoutes } from "./routes/users.routers";

export const useRouter = () => {
  const user = useAuthStore((s) => s.user);
  const role = user?.account?.role;

  const getRoutesByRole = (routes: A[]) =>
    routes.filter(
      (route) => !route.roles?.length || route.roles.includes(role)
    );

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
      errorElement: <NotFound />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      element: <ProtectedRoutes />,
      children: getRoutesByRole([
        ...route1Route,
        ...orderRoutes,
        ...sourceRoutes,
        ...shippingStoreRoutes,
        ...userRoutes,
      ]),
    },
  ]);

  return { router };
};
