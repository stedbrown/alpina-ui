import jsqr from 'jsqr'

// Bundler resolution exposes the callable, while NodeNext exposes the CommonJS default.
type Decode = typeof jsqr extends { default: infer Fn } ? Fn : typeof jsqr
const decode = jsqr as unknown as Decode

/** Decode and mask unrelated QR symbols so a nearby web link cannot hide the payment code. */
export function readQrPixels(pixels: ImageData): string | undefined {
  for (let i = 0; i < 8; i++) {
    const code = decode(pixels.data, pixels.width, pixels.height, { inversionAttempts: 'attemptBoth' })
    if (!code) return
    if (/^SPC(?:\r?\n|$)/.test(code.data)) return code.data
    const corners = [code.location.topLeftCorner, code.location.topRightCorner, code.location.bottomLeftCorner, code.location.bottomRightCorner]
    const left = Math.max(0, Math.floor(Math.min(...corners.map(p => p.x))))
    const right = Math.min(pixels.width, Math.ceil(Math.max(...corners.map(p => p.x))))
    const top = Math.max(0, Math.floor(Math.min(...corners.map(p => p.y))))
    const bottom = Math.min(pixels.height, Math.ceil(Math.max(...corners.map(p => p.y))))
    for (let y = top; y < bottom; y++) pixels.data.fill(255, (y * pixels.width + left) * 4, (y * pixels.width + right) * 4)
  }
}
