<template>
  <div ref="chartContainer" style="width: 100%; height: 150px">
    <!-- Chart width will be at maximum the container's width. It is responsive -->
    <canvas
      ref="chart"
      width="500"
      height="150"
    ></canvas>
  </div>
</template>

<script>
import {
  Chart,
  BarController,
  BarElement,
  PointElement,
  LinearScale,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { mapState } from "vuex";

// Common options for all charts
Chart.register(BarController, BarElement, PointElement, LinearScale, TimeScale);
Chart.defaults.datasets.type = "line";
Chart.defaults.font.family = "'Roboto', sans-serif";
Chart.defaults.maintainAspectRatio = false;

// Configuration constants for quart queue length and update period in milliseconds
const queueLength = 30;

// Chart update handle
let updaterInterval;

export default {
  props: {
    value: Number, // Current value to be added to chart
    unit: String, // vue-i18n number format key
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
          ticks: {
            precision: 2, // Round step size to 2 decimal places
          },
          grid: {
            drawBorder: false,
            color: 'rgba(255,255,255,.1)',
          },
        },
      },
    };

    this.chart = new Chart(this.$refs.chart, {
      type: "bar",
      data,
      options,
    });
  },
  destroyed() {
    clearInterval(updaterInterval);
  },
  methods: {
    /**
     * Update the chart with the current value.
     * This method is used by {@link setInterval} to be executed every {@link taskPeriod} milliseconds.
     */
    updateChart() {
      this.$nextTick(() => {
        this.enqueue(this.value);
        this.chart.update();
      });
    },

    /**
     * Create a queue of given length filled with 0 values.
     * @param {Number} length The length of the queue to generate.
     * @returns {Array} An array with specified queue length, filled with 0s.
     */
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

    /**
     * Enqueue a value into the chart.
     * @param {Number} value The value to enqueue.
     */
    enqueue(value) {
      let data = this.chart.data.datasets[0].data;
      while (data.length >= queueLength) {
        data.shift();
      }
      data.push({ x: new Date(), y: value });
    },

    /**
     * Get locale-sensitive Y-axis unit name.
     * @returns {String} The unit of the axis in localized form.
     */
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