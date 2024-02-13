import Mutations from "../enums/Mutations";
import { Store } from "../plugins/store";
import { computed } from "vue";
import { useStore } from "vuex";

export const useComputedStoreAttribute = (
  attrName: keyof Store,
  mutation: Mutations
) => {
  const store = useStore<Store>();
  return computed({
    get() {
      return store.state[attrName];
    },
    set(value) {
      store.commit(mutation, value);
    },
  });
};
