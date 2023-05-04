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

import { fastAtan, fastNegExp, mix, square } from './utils'
import type { Entity } from './entity'

export function halflifeToDamping(halflife: number, epsilon: number = 1e-5) {
  return (4 * Math.LN2) / (halflife + epsilon)
}

export function dampingToHalflife(damping: number, epsilon: number = 1e-5) {
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

export function damper(
  start: number,
  end: number,
  halflife: number,
  dt: number,
  epsilon: number = 1e-5,
) {
  return mix(start, end, 1 - fastNegExp((Math.LN2 * dt) / (halflife + epsilon)))
}

export function decayDamper(x: number, halflife: number, dt: number, epsilon: number = 1e-5) {
  return x * fastNegExp((Math.LN2 * dt) / (halflife + epsilon))
}

export function springStiffnessDamping(
  out: Entity,
  start: Entity,
  end: Entity,
  stiffness: number,
  damping: number,
  dt: number,
  epsilon: number = 1e-5,
) {
  const g = end.x
  const q = end.v
  const s = stiffness
  const d = damping
  const c = g + (d * q) / (s + epsilon)
  const y = d / 2

  if (Math.abs(s - (d * d) / 4) < epsilon) {
    const j0 = start.x - c
    const j1 = start.v + j0 * y
    const eydt = fastNegExp(y * dt)
    out.x = j0 * eydt + dt * j1 * eydt + c
    out.v = -y * j0 * eydt - y * dt * j1 * eydt + j1 * eydt
  } else if (s - (d * d) / 4 > 0) {
    const w = Math.sqrt(s - (d * d) / 4)
    let j = Math.sqrt(square(start.v + y * (start.x - c)) / (w * w + epsilon) + square(start.x - c))
    const p = fastAtan((start.v + (start.x - c) * y) / (-(start.x - c) * w + epsilon))
    j = start.x - c > 0.0 ? j : -j
    const eydt = fastNegExp(y * dt)
    out.x = j * eydt * Math.cos(w * dt + p) + c
    out.v = -y * j * eydt * Math.cos(w * dt + p) - w * j * eydt * Math.sin(w * dt + p)
  } else if (s - (d * d) / 4 < 0) {
    const y0 = (d + Math.sqrt(d * d - 4 * s)) / 2
    const y1 = (d - Math.sqrt(d * d - 4 * s)) / 2
    const j1 = (c * y0 - start.x * y0 - start.v) / (y1 - y0)
    const j0 = start.x - j1 - c
    const ey0dt = fastNegExp(y0 * dt)
    const ey1dt = fastNegExp(y1 * dt)
    out.x = j0 * ey0dt + j1 * ey1dt + c
    out.v = -y0 * j0 * ey0dt - y1 * j1 * ey1dt
  }
}

export function springHalflifeFrequency(
  out: Entity,
  start: Entity,
  end: Entity,
  frequency: number,
  halflife: number,
  dt: number,
  epsilon: number = 1e-5,
) {
  springStiffnessDamping(
    out,
    start,
    end,
    frequencyToStiffness(frequency),
    halflifeToDamping(halflife),
    dt,
    epsilon,
  )
}

export function spring(
  out: Entity,
  start: Entity,
  end: Entity,
  dampingRatio: number,
  halflife: number,
  dt: number,
  epsilon: number = 1e-5,
) {
  const damping = halflifeToDamping(halflife)
  return springStiffnessDamping(
    out,
    start,
    end,
    dampingRatioToStiffness(dampingRatio, damping),
    damping,
    dt,
    epsilon,
  )
}

export function criticalSpring(
  out: Entity,
  start: Entity,
  end: Entity,
  halflife: number,
  dt: number,
) {
  const g = end.x
  const q = end.v
  const d = halflifeToDamping(halflife)
  const c = g + (d * q) / ((d * d) / 4)
  const y = d / 2
  const j0 = start.x - c
  const j1 = start.v + j0 * y
  const eydt = fastNegExp(y * dt)
  out.x = eydt * (j0 + j1 * dt) + c
  out.v = eydt * (start.v - j1 * y * dt)
}

export function simpleSpring(out: Entity, entity: Entity, x: number, halflife: number, dt: number) {
  const y = halflifeToDamping(halflife) / 2
  const j0 = entity.x - x
  const j1 = entity.v + j0 * y
  const eydt = fastNegExp(y * dt)
  out.x = eydt * (j0 + j1 * dt) + x
  out.v = eydt * (entity.v - j1 * y * dt)
}

export function decaySpring(out: Entity, entity: Entity, halflife: number, dt: number) {
  const y = halflifeToDamping(halflife) / 2
  const j1 = entity.v + entity.x * y
  const eydt = fastNegExp(y * dt)
  out.x = eydt * (entity.x + j1 * dt)
  out.v = eydt * (entity.v - j1 * y * dt)
}
