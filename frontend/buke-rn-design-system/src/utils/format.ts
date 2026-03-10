export const formatAll = (amountAll: number) => `${amountAll.toLocaleString("en-US")} ALL`;

export const formatEta = (minutes: number) =>
  minutes <= 1 ? "1 min" : `${Math.round(minutes)} min`;
