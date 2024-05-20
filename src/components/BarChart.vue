<template>
  <div ref="chartContainer" style="width: 100%; height: 150px">
    <!-- Chart width will be at maximum the container's width. It is responsive -->
    <canvas ref="chartRef" width="500" height="150" />
  </div>
</template>

<script setup lang="ts">
import {
  Chart,
  BarController,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale
} from "chart.js";
import { useComputedStoreAttribute } from "../composables/useComputedStoreAttribute";
import { StoreAttributes } from "../plugins/store";
import { defineProps, ref, onMounted, onUnmounted, watchEffect, nextTick } from "vue";
import { useTheme } from "vuetify/lib/framework.mjs";
import { useI18n } from "vue-i18n";

// Common options for all charts
Chart.register(BarController, BarElement, PointElement, LinearScale, CategoryScale);
Chart.defaults.datasets.type = "line";
Chart.defaults.font.family = "'Roboto', sans-serif";
Chart.defaults.maintainAspectRatio = false;

// Configuration constants for quart queue length and update period in milliseconds
const queueLength = 30;

// Chart update handle
let updaterInterval: ReturnType<typeof setTimeout>;

const { value, unit } = defineProps<{
  value: number,
  unit: string
}>();

const theme = useTheme();
const t = useI18n();

let chart: Chart;
const chartRef = ref(null);

const backgroundHue = useComputedStoreAttribute(StoreAttributes.BACKGROUND_HUE);
const locale = useComputedStoreAttribute(StoreAttributes.LOCALE);

onMounted(() => {
  let data = {
    datasets: [
      {
        backgroundColor: theme.themes.value.dark.colors.primary,
        data: createQueue(queueLength),
      },
    ],
  };
  let options = {
    scales: {
      x: {
        type: 'category',
        labels: new Array(queueLength).fill(''),
        display: false
      },
      y: {
        title: {
          display: true,
          text: getYAxesUnit(),
        },
        min: 0,
        ticks: {
          precision: 2, // Round step size to 2 decimal places
        },
        border: {
          display: false,
        },
        grid: {
          color: 'rgba(255,255,255,.1)',
        },
      },
    },
  };

  chart = new Chart(chartRef.value, {
    type: "bar",
    data,
    options,
  });
})

onUnmounted(() => {
  clearInterval(updaterInterval);
})

watchEffect(() => {
  if (!chart) {
    return;
  }

  chart.data.datasets[0].backgroundColor =
    theme.themes.value.dark.colors.primary;
  chart.update();
})

watchEffect(() => {
  if (!chart) {
    return;
  }

  chart.options.scales.y.title.text = getYAxesUnit();
  chart.update();
})

/**
 * Update the chart with the current value.
 * This method is used by {@link setInterval} to be executed every {@link taskPeriod} milliseconds.
 */
function updateChart() {
  nextTick(() => {
    enqueue(value);
    chart.update();
  });
}

/**
 * Create a queue of given length filled with 0 values.
 * @param {Number} length The length of the queue to generate.
 * @returns {Array} An array with specified queue length, filled with 0s.
 */
function createQueue(length: number) {
  return Array.from(new Array(length)).fill(0);
}

/**
 * Enqueue a value into the chart.
 * @param {number} value The value to enqueue.
 */
function enqueue(value: number) {
  let data = chart.data.datasets[0].data;
  while (data.length >= queueLength) {
    data.shift();
  }
  data.push(value);
}

/**
 * Get locale-sensitive Y-axis unit name.
 * @returns {string} The unit of the axis in localized form.
 */
function getYAxesUnit() {
  return new Intl.NumberFormat(
    locale.value,
    t.numberFormats.value[locale.value][unit]
  )
    .formatToParts(0) // Use arbitrary number, we are only interested in unit
    .find((item) => item.type == "unit").value;
}
</script>