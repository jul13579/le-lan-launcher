import { mapState } from "vuex";

export default {
  props: {
    online: Boolean
  },
  computed: mapState(["started"])
};
