<template>
  <div class="overlay">
    <template v-if="!online">
      <div class="offline">
        <breeding-rhombus-spinner
          :animation-duration="2000"
          :size="65"
          color="rgb(200,200,200)"
        />
        <div>Verbindung zum Service wird hergestellt...</div>
      </div>
    </template>
    <template v-else>
      <div>

      </div>
    </template>
  </div>
</template>

<script>
import online from "../mixins/online";
import { BreedingRhombusSpinner } from "epic-spinners";

export default {
  mixins: [online],
  components: {
    BreedingRhombusSpinner
  }
};
</script>

<style lang="sass">
.offline
    width: 100%
    height: 100%
    div:nth-child(1)
        margin: 0 auto
        top: 2rem
    div:nth-child(2)
        top: 4rem
        width: 100% 
        text-align: center
        position: relative
</style>