import { create } from "zustand";

type LoadingStoreType = {
  loadingList: string[];
  addLoading: (key: string) => void;
  removeLoading: (config: { key: string; isAll?: boolean }) => void;
};

const useLoadingStore = create<LoadingStoreType>((set, get) => ({
  loadingList: [],
  addLoading: (key: string) =>
    set({ loadingList: [...get().loadingList, key] }),
  removeLoading: (config: { key: string; isAll?: boolean }) => {
    if (config.isAll) {
      set({ loadingList: [] });
    } else if (config.key) {
      set({
        loadingList: get().loadingList.filter((item) => item !== config.key),
      });
    }
  },
}));

export const useLoading = () => {
  const loadingList = useLoadingStore((state) => state.loadingList);
  const addLoading = useLoadingStore((state) => state.addLoading);
  const removeLoading = useLoadingStore((state) => state.removeLoading);

  const isLoading = loadingList.length > 0;

  return { isLoading, showLoading: addLoading, closeLoading: removeLoading };
};
