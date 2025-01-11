import { createBrowserRouter } from "react-router-dom";
import { Home, Login, ProtectedRoutes } from "./routeLoader";
import { orderRoutes } from "./routes/order.routes";
import useAuthStore from "@/store/auth";
import NotFound from "@/pages/public/not-found/404";
import { sourceRoutes } from "./routes/sources.routers";
import { shippingStoreRoutes } from "./routes/shippingStores.routers";
import { userRoutes } from "./routes/users.routers";
import { transactionRoutes } from "./routes/transactions.routers";
import { statisticRoutes } from "./routes/statistics.routes";

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
        ...orderRoutes,
        ...sourceRoutes,
        ...shippingStoreRoutes,
        ...userRoutes,
        ...transactionRoutes,
        ...statisticRoutes,
      ]),
    },
  ]);

  return { router };
};
