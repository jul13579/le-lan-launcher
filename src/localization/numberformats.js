import langs from "./langs";

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
};

let numberFormats = {};
for (var lang in langs) {
  numberFormats[lang] = commonNumberFormats;
}

export default numberFormats;
