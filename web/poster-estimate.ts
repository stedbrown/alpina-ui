export const initialCopies = 100
export const pressSetup = 24
export const unitPrice = (secondInk: boolean) => secondInk ? 1.60 : 1.20

/** One setup charge per edition, plus paper and ink for each poster. */
export function posterEstimate(copies: number, secondInk: boolean) {
  return (pressSetup * 100 + copies * Math.round(unitPrice(secondInk) * 100)) / 100
}
