import { createBrowserRouter } from "react-router-dom";
import { route1Route } from "./routes/route1.routes";
import { Home, Login, ProtectedRoutes } from "./routeLoader";

export const useRouter = () => {
  const role = 1;

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
      children: getRoutesByRole([...route1Route]),
    },
  ]);

  return { router };
};
