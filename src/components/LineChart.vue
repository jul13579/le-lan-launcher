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
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { mapState } from "vuex";

// Common options for all charts
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Filler
);
Chart.defaults.datasets.type = "line";
Chart.defaults.font.family = "'Roboto', sans-serif";
Chart.defaults.elements.line.fill = true;

const queueLength = 30;
const taskPeriod = 5000;
let updaterInterval;

export default {
  props: {
    value: Number,
    unit: String, // vue-i18n number format key
    max: {
      type: Number,
      required: false,
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  computed: {
    ...mapState(["backgroundHue", "locale"]),
  },
  watch: {
    backgroundHue() {
      this.chart.data.datasets[0].backgroundColor =
        this.$vuetify.theme.themes.dark.primary;
      this.chart.update();
    },
    locale() {
      this.chart.options.scales.y.title.text = this.getYAxesUnit();
      this.chart.update();
    },
  },
  mounted() {
    // Create objects here, so we dont have to deep clone them from global consts
    let data = {
      datasets: [
        {
          backgroundColor: this.$vuetify.theme.themes.dark.primary,
          data: this.createQueue(queueLength),
        },
      ],
    };
    let options = {
      scales: {
        x: {
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
        y: {
          title: {
            display: true,
            text: this.getYAxesUnit(),
          },
          min: 0,
          max: this.max,
          ticks: {
            precision: 2, // Round step size to 2 decimal places
          },
        },
      },
    };

    this.chart = new Chart(this.$refs.chart, {
      type: "line",
      data,
      options,
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
    getYAxesUnit() {
      let locale = this.$i18n.locale;
      return new Intl.NumberFormat(
        locale,
        this.$i18n.numberFormats[locale][this.unit]
      )
        .formatToParts(0) // Use arbitrary number, we are only interested in unit
        .find((item) => item.type == "unit").value;
    },
  },
};
</script>