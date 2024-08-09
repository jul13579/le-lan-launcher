import langs from "./langs";

/**
 * Configuration of bandwidth number formats.
 */
const commonNumberFormats = {
  mbps: {
    style: "unit",
    unit: "megabyte-per-second",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  percent: {
    style: "unit",
    unit: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
} as const;

const numberFormats = Object.fromEntries(
  Object.entries(langs).map(([lang]) => [lang, commonNumberFormats]),
) as {
  [k in keyof typeof langs]: typeof commonNumberFormats;
};

export default numberFormats;
