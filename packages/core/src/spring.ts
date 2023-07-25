/*
Copyright (c) 2023 Jonas Luebbers

Based on https://github.com/orangeduck/Spring-It-On

Copyright (c) 2021 Daniel Holden

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { fastAtan, fastNegExp, mix, square } from './math'
import { glMatrix } from 'gl-matrix'

const epsilon = glMatrix.EPSILON

export type KeyOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T]

export function halflifeToDamping(halflife: number) {
  return (4 * Math.LN2) / (halflife + epsilon)
}

export function dampingToHalflife(damping: number) {
  return (4 * Math.LN2) / (damping + epsilon)
}

export function frequencyToStiffness(frequency: number) {
  return square(2 * Math.PI * frequency)
}

export function stiffnessToFrequency(stiffness: number) {
  return Math.sqrt(stiffness) / (2 * Math.PI)
}

export function criticalHalflife(frequency: number) {
  return dampingToHalflife(Math.sqrt(frequencyToStiffness(frequency) * 4))
}

export function criticalFrequency(halflife: number) {
  return stiffnessToFrequency(square(halflifeToDamping(halflife)) / 4)
}

export function dampingRatioToStiffness(ratio: number, damping: number) {
  return square(damping / (ratio * 2))
}

export function dampingRatioToDamping(ratio: number, stiffness: number) {
  return ratio * 2 * Math.sqrt(stiffness)
}

export function damper(start: number, end: number, halflife: number, dt: number): number {
  return mix(start, end, 1 - fastNegExp((Math.LN2 * dt) / (halflife + epsilon)))
}

export function decayDamper(position: number, halflife: number, dt: number): number {
  return position * fastNegExp((Math.LN2 * dt) / (halflife + epsilon))
}

export function springStiffnessDamping<T>(
  outPosition: T,
  outPositionKey: KeyOfType<T, number>,
  outVelocity: T,
  outVelocityKey: KeyOfType<T, number>,
  startPosition: number,
  startVelocity: number,
  endPosition: number,
  endVelocity: number,
  stiffness: number,
  damping: number,
  dt: number,
) {
  const g = endPosition
  const q = endVelocity
  const s = stiffness
  const d = damping
  const c = g + (d * q) / (s + epsilon)
  const y = d / 2

  if (Math.abs(s - (d * d) / 4) < epsilon) {
    const j0 = startPosition - c
    const j1 = startVelocity + j0 * y
    const eydt = fastNegExp(y * dt)
    outPosition[outPositionKey] = (j0 * eydt + dt * j1 * eydt + c) as never
    outVelocity[outVelocityKey] = (-y * j0 * eydt - y * dt * j1 * eydt + j1 * eydt) as never
  } else if (s - (d * d) / 4 > 0) {
    const w = Math.sqrt(s - (d * d) / 4)
    let j = Math.sqrt(
      square(startVelocity + y * (startPosition - c)) / (w * w + epsilon) +
        square(startPosition - c),
    )
    const p = fastAtan(
      (startVelocity + (startPosition - c) * y) / (-(startPosition - c) * w + epsilon),
    )
    j = startPosition - c > 0.0 ? j : -j
    const eydt = fastNegExp(y * dt)
    outPosition[outPositionKey] = (j * eydt * Math.cos(w * dt + p) + c) as never
    outVelocity[outVelocityKey] = (-y * j * eydt * Math.cos(w * dt + p) -
      w * j * eydt * Math.sin(w * dt + p)) as never
  } else if (s - (d * d) / 4 < 0) {
    const y0 = (d + Math.sqrt(d * d - 4 * s)) / 2
    const y1 = (d - Math.sqrt(d * d - 4 * s)) / 2
    const j1 = (c * y0 - startPosition * y0 - startVelocity) / (y1 - y0)
    const j0 = startPosition - j1 - c
    const ey0dt = fastNegExp(y0 * dt)
    const ey1dt = fastNegExp(y1 * dt)
    outPosition[outPositionKey] = (j0 * ey0dt + j1 * ey1dt + c) as never
    outVelocity[outVelocityKey] = (-y0 * j0 * ey0dt - y1 * j1 * ey1dt) as never
  }
}

export function springFrequencyHalflife<T>(
  outPosition: T,
  outPositionKey: KeyOfType<T, number>,
  outVelocity: T,
  outVelocityKey: KeyOfType<T, number>,
  startPosition: number,
  startVelocity: number,
  endPosition: number,
  endVelocity: number,
  frequency: number,
  halflife: number,
  dt: number,
) {
  springStiffnessDamping(
    outPosition,
    outPositionKey,
    outVelocity,
    outVelocityKey,
    startPosition,
    startVelocity,
    endPosition,
    endVelocity,
    frequencyToStiffness(frequency),
    halflifeToDamping(halflife),
    dt,
  )
}

export function spring<T>(
  outPosition: T,
  outPositionKey: KeyOfType<T, number>,
  outVelocity: T,
  outVelocityKey: KeyOfType<T, number>,
  startPosition: number,
  startVelocity: number,
  endPosition: number,
  endVelocity: number,
  halflife: number,
  dampingRatio: number,
  dt: number,
) {
  const damping = halflifeToDamping(halflife)
  springStiffnessDamping(
    outPosition,
    outPositionKey,
    outVelocity,
    outVelocityKey,
    startPosition,
    startVelocity,
    endPosition,
    endVelocity,
    dampingRatioToStiffness(dampingRatio, damping),
    damping,
    dt,
  )
}

export function criticalSpring<T>(
  outPosition: T,
  outPositionKey: KeyOfType<T, number>,
  outVelocity: T,
  outVelocityKey: KeyOfType<T, number>,
  startPosition: number,
  startVelocity: number,
  endPosition: number,
  endVelocity: number,
  halflife: number,
  dt: number,
) {
  const g = endPosition
  const q = endVelocity
  const d = halflifeToDamping(halflife)
  const c = g + (d * q) / ((d * d) / 4)
  const y = d / 2
  const j0 = startPosition - c
  const j1 = startVelocity + j0 * y
  const eydt = fastNegExp(y * dt)
  outPosition[outPositionKey] = (eydt * (j0 + j1 * dt) + c) as never
  outVelocity[outVelocityKey] = (eydt * (startVelocity - j1 * y * dt)) as never
}

export function simpleSpring<T>(
  outPosition: T,
  outPositionKey: KeyOfType<T, number>,
  outVelocity: T,
  outVelocityKey: KeyOfType<T, number>,
  startPosition: number,
  startVelocity: number,
  endPosition: number,
  halflife: number,
  dt: number,
) {
  const y = halflifeToDamping(halflife) / 2
  const j0 = startPosition - endPosition
  const j1 = startVelocity + j0 * y
  const eydt = fastNegExp(y * dt)
  outPosition[outPositionKey] = (eydt * (j0 + j1 * dt) + endPosition) as never
  outVelocity[outVelocityKey] = (eydt * (startVelocity - j1 * y * dt)) as never
}

export function decaySpring<T>(
  outPosition: T,
  outPositionKey: KeyOfType<T, number>,
  outVelocity: T,
  outVelocityKey: KeyOfType<T, number>,
  startPosition: number,
  startVelocity: number,
  halflife: number,
  dt: number,
) {
  const y = halflifeToDamping(halflife) / 2
  const j1 = startVelocity + startPosition * y
  const eydt = fastNegExp(y * dt)
  outPosition[outPositionKey] = (eydt * (startPosition + j1 * dt)) as never
  outVelocity[outVelocityKey] = (eydt * (startVelocity - j1 * y * dt)) as never
}
