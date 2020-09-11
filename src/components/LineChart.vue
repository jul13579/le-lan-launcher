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
    chartData() {
      return {
        type: "line",
        datasets: [
          {
            backgroundColor: this.$vuetify.theme.themes.dark.primary,
            data: [],
          },
        ],
        fill: true,
      };
    },
  },
  mounted() {
    this.chart = new Chart(this.$refs.chart, {
      type: "line",
      data: this.chartData,
      options: lineChartOptions,
    });
    updaterInterval = setInterval(this.chartUpdater, 5000);
  },
  destroyed() {
    clearInterval(updaterInterval);
  },
  methods: {
    chartUpdater() {
      this.enqueue(this.value);
      this.chart.update();
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