import { lazy } from "react";

const Home = lazy(() => import("../pages/public/home/Home"));
const Login = lazy(() => import("../pages/public/login/Login"));
const ProtectedRoutes = lazy(() => import("../router/ProtectedRoutes"));

export { Home, Login, ProtectedRoutes };
