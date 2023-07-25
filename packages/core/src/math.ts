export function mix(x: number, y: number, a: number) {
  return (1 - a) * x + a * y
}

export function clamp(min: number, max: number, x: number) {
  return Math.min(Math.max(x, min), max)
}

export function copySign(x: number, y: number) {
  return Math.sign(x) === Math.sign(y) ? x : -x
}

export function square(x: number) {
  return x * x
}

export function fastNegExp(x: number) {
  return 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
}

export function fastAtan(x: number) {
  const z = Math.abs(x)
  const w = z > 1 ? 1 / z : z
  const y = (Math.PI / 4) * w - w * (w - 1) * (0.2447 + 0.0663 * w)
  return copySign(z > 1 ? Math.PI / 2 - y : y, x)
}
