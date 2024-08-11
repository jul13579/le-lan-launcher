export const latestBpsFromSamples = (queue: [number, number][]) => {
  const [sample1, sample2] = [queue.at(-2), queue.at(-1)];
  return bpsFromSamples(sample1, sample2);
};

export const bpsFromSamples = (
  [time1, bps1]: [number, number],
  [time2, bps2]: [number, number],
) => (bps2 - bps1) / ((time2 - time1) / 1000) || 0;
