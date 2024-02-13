import { Store, StoreAttributes } from "../plugins/store";
import { computed } from "vue";
import { useStore } from "vuex";

export const useComputedStoreAttribute = (attrName: StoreAttributes) => {
  const store = useStore<Store>();
  return computed({
    get() {
      return store.state[attrName];
    },
    set(value) {
      store.commit(attrName, value);
    },
  });
};
