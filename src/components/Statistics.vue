<template>
  <div>

  </div>
</template>

<script>
import AJAX from "../ajax";

let intervalHandle;

export default {
  created() {
    clearInterval(intervalHandle);
    intervalHandle = setInterval(() => {
      AJAX.Syncthing.System.ping().then(response => {
        console.log(response);
      });
    }, 5000);
  }
};
</script>