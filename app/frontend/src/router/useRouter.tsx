import { createBrowserRouter } from "react-router-dom";
import { route1Route } from "./routes/route1.routes";
import { Home, Login, ProtectedRoutes } from "./routeLoader";
import { orderRoutes } from "./routes/order.routes";
import useAuthStore from "@/store/auth";

export const useRouter = () => {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  const getRoutesByRole = (routes: A[]) =>
    routes.filter(
      (route) => !route.roles?.length || route.roles.includes(role)
    );

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
      errorElement: <>404</>,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      element: <ProtectedRoutes />,
      children: getRoutesByRole([...route1Route, ...orderRoutes]),
    },
  ]);

  return { router };
};
