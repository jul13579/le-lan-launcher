export const latestBpsFromSamples = (queue: [number, number][]) => {
  const [[time1, bps1], [time2, bps2]] = [queue.at(-2), queue.at(-1)];
  return (bps2 - bps1) / ((time2 - time1) / 1000) || 0;
};
