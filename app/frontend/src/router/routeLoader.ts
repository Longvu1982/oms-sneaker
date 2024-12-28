import { lazy } from "react";

const Home = lazy(() => import("../pages/public/home/Home"));
const Login = lazy(() => import("../pages/public/login/Login"));
const ProtectedRoutes = lazy(() => import("../router/ProtectedRoutes"));
const Test1 = lazy(() => import("../pages/private/test1/Test1"));
const Test2 = lazy(() => import("../pages/private/test2/Test2"));

export { Home, Login, ProtectedRoutes, Test1, Test2 };
