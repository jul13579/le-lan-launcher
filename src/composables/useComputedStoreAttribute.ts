import { Store, StoreAttributes } from "../plugins/store";
import { computed } from "vue";
import { useStore } from "vuex";

export const useComputedStoreAttribute = <T>(attrName: StoreAttributes) => {
  const store = useStore<Store>();
  return computed({
    get() {
      return store.state[attrName] as unknown as T;
    },
    set(value) {
      store.commit(attrName, value);
    },
  });
};
