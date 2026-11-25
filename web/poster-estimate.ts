export const initialCopies = 100

/** One setup charge per edition, plus paper and ink for each poster. */
export function posterEstimate(copies: number, secondInk: boolean) {
  const setupCents = 2400
  const printCents = secondInk ? 160 : 120
  return (setupCents + copies * printCents) / 100
}
