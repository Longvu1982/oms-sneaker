import useAuthStore from "@/store/auth";
import { Navigate } from "react-router-dom";

const Home = () => {
  const user = useAuthStore((s) => s.user);
  if (user) return <Navigate to="/route1" />;
  return <Navigate to="/login" />;
};

export default Home;
