import Mutations from "src/enums/Mutations";
import { Store } from "src/plugins/store";
import { computed } from "vue";
import { useStore } from "vuex";

const useComputedStoreAttribute = (
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
