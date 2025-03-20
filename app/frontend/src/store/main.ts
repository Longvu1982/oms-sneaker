import { create } from "zustand";

interface MainStore {
  mainRef: React.RefObject<HTMLElement> | null;
  setMainRef: (ref: React.RefObject<HTMLElement>) => void;
}

const useMainStore = create<MainStore>((set) => ({
  mainRef: null,
  setMainRef: (ref) => set({ mainRef: ref }),
}));

export default useMainStore;
