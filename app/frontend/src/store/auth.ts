import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  balance: number;
  account: Account;
}

type Account = {
  id: string;
  username: string;
  role: string;
};

type AuthStoreType = {
  user?: User;
  setUser: (user: User) => void;
  logout: () => void;
};

const useAuthStore = create<AuthStoreType>()(
  persist(
    (set) => ({
      user: undefined,
      setUser: (user) => set({ user }),
      logout: () => set({ user: undefined }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useAuthStore;
