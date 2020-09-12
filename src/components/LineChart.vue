<template>
  <div style="width: 350px; height: 150px">
    <canvas
      ref="chart"
      width="350"
      height="150"
    ></canvas>
  </div>
</template>

<script>
import Chart from "chart.js";
import { mapState } from "vuex";

const lineChartOptions = {
  legend: {
    display: false,
  },
  tooltips: {
    enabled: true,
  },
  scales: {
    xAxes: [
      {
        display: false,
        type: "time",
        time: {
          unit: "second",
          displayFormats: {
            second: "mm:ss",
          },
          stepSize: 5,
        },
      },
    ],
  },
};

const queueLength = 30;
const taskPeriod = 5000;
let updaterInterval;

export default {
  props: {
    value: Number,
  },
  data() {
    return {
      chart: null,
    };
  },
  computed: {
    ...mapState(["backgroundHue"]),
  },
  watch: {
    backgroundHue() {
      this.chart.data.datasets[0].backgroundColor = this.$vuetify.theme.themes.dark.primary;
      this.chart.update();
    },
  },
  mounted() {
    this.chart = new Chart(this.$refs.chart, {
      type: "line",
      data: {
        type: "line",
        datasets: [
          {
            backgroundColor: this.$vuetify.theme.themes.dark.primary,
            data: this.createQueue(queueLength),
          },
        ],
        fill: true,
      },
      options: lineChartOptions,
    });
    // ! Use periodic task to update chart, becuase multiple euqal numbers in this.value wont trigger the watcher
    updaterInterval = setInterval(this.chartUpdater, taskPeriod);
  },
  destroyed() {
    clearInterval(updaterInterval);
  },
  methods: {
    chartUpdater() {
      this.enqueue(this.value);
      this.chart.update();
    },
    createQueue(length) {
      return Array.from(new Array(length)).map((item, index) => {
        let object = {
          // Create objects in taskPeriod steps, so the diagram is always populated
          x: new Date() - (length - (index + 1)) * taskPeriod,
          y: 0,
        };
        return object;
      });
    },
    enqueue(value) {
      let data = this.chart.data.datasets[0].data;
      if (data.length >= queueLength) {
        data.shift();
      }
      data.push({ x: new Date(), y: value });
    },
  },
};
</script>