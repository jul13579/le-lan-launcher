import { Box, useTheme } from "@mui/material";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  PointElement,
} from "chart.js";
import { FunctionComponent, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { bpsFromSamples, latestBpsFromSamples } from "../utils/bpsFromSamples";

Chart.register(
  BarController,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
);
Chart.defaults.font.family = "'Roboto', sans-serif";
Chart.defaults.maintainAspectRatio = false;

interface BarChartProps {
  samples: [number, number][];
}

export const BarChart: FunctionComponent<BarChartProps> = ({ samples }) => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const {
    i18n: { language },
  } = useTranslation();
  const {
    palette: {
      primary: { main: primaryColor },
    },
  } = useTheme();

  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const chartContainer = useRef<HTMLCanvasElement>();
  const chart = useRef<Chart<"bar">>();

  const yAxisUnit = useMemo(
    () =>
      Intl.NumberFormat(language, {
        style: "unit",
        unit: "megabyte-per-second",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
        .formatToParts(0) // Use arbitrary number, we are only interested in unit
        .find((item) => item.type === "unit").value,
    [language],
  );

  /* -------------------------------------------------------------------------- */
  /*                             Component Lifecycle                            */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!chartContainer.current) {
      return;
    }
    const newChart = new Chart(chartContainer.current, {
      type: "bar",
      data: {
        datasets: [
          {
            backgroundColor: primaryColor,
            data: samples.reduce((previousValue, sample, currentIndex) => {
              if (currentIndex === 0) {
                return previousValue;
              }
              return [
                ...previousValue,
                bpsFromSamples(samples[currentIndex - 1], sample) / 1024 ** 2,
              ];
            }, [] as number[]),
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: "category",
            labels: new Array(samples.length).fill(""),
            display: false,
          },
          y: {
            title: {
              display: true,
              text: yAxisUnit,
            },
            min: 0,
            ticks: {
              precision: 2, // Round step size to 2 decimal places
            },
            border: {
              display: false,
            },
            grid: {
              color: "rgba(255,255,255,.1)",
            },
          },
        },
      },
    });
    chart.current = newChart;
    return () => newChart.destroy();
  }, [chartContainer]);

  useEffect(() => {
    if (!chart.current) return;
    chart.current.options.scales.y.title.text = yAxisUnit;
    chart.current.update();
  }, [yAxisUnit]);

  useEffect(() => {
    if (!chart.current) return;
    chart.current.data.datasets[0].backgroundColor = primaryColor;
    chart.current.update();
  }, [primaryColor]);

  useEffect(() => {
    if (!chart.current) return;
    const data = chart.current.data.datasets[0].data;
    data.shift();
    data.push(latestBpsFromSamples(samples) / 1024 ** 2);
    chart.current.update();
  }, [samples, chart]);

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <Box pt={2}>
      <canvas ref={chartContainer} />
    </Box>
  );
};
