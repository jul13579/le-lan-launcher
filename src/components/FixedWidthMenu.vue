<script>
import { VMenu } from "vuetify/lib";
import { convertToUnit } from "vuetify/lib/util/helpers";

/**
 * Extend VMenu with functionality to set the maxWidth equal to minWidth.
 */
export default {
  extends: VMenu,
  name: "fixed-width-menu",
  computed: {
    calculatedMaxWidth() {
      return (
        // Copied from VMenu#calculateMinWidth
        convertToUnit(
          Math.min(
            this.dimensions.activator.width +
              Number(this.nudgeWidth) +
              (this.auto ? 16 : 0),
            Math.max(this.pageWidth - 24, 0)
          )
        ) || "0"
      );
    },
  },
};
</script>