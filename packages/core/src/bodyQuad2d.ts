import { mat2dCopy, vec2Copy } from '@chloranthy/gl-matrix'
import { Rect, bodyQuad2dCreate, quad2dCreate, quad2dFromRect, quad2dZero } from '.'
import { Body } from './body'
import { equals } from './common'
import { Quad2d } from './quad2d'
import { simpleSpring as coreSimpleSpring } from '@nonphoto/spring'

export interface BodyQuad2d extends Body<Quad2d> {}

export function create(): BodyQuad2d {
  return {
    p: quad2dCreate(),
    v: quad2dZero(quad2dCreate()),
  }
}

export function fromRect(out: BodyQuad2d, rect: Readonly<Rect>): BodyQuad2d {
  quad2dFromRect(out.p, rect)
  quad2dZero(out.v)
  return out
}

export function copy(out: BodyQuad2d, quad: Readonly<BodyQuad2d>): BodyQuad2d {
  mat2dCopy(out.p.ij, quad.p.ij)
  mat2dCopy(out.v.ij, quad.v.ij)
  vec2Copy(out.p.k, quad.p.k)
  vec2Copy(out.v.k, quad.v.k)
  return out
}

export function clone(quad: Readonly<BodyQuad2d>): BodyQuad2d {
  const out = bodyQuad2dCreate()
  copy(out, quad)
  return out
}

export function isAtRest(body: Readonly<BodyQuad2d>, p: Quad2d): boolean {
  return (
    equals(body.p.k[0], p.k[0]) &&
    equals(body.p.k[1], p.k[1]) &&
    equals(body.p.ij[0], p.ij[0]) &&
    equals(body.p.ij[1], p.ij[1]) &&
    equals(body.p.ij[2], p.ij[2]) &&
    equals(body.p.ij[3], p.ij[3]) &&
    equals(body.v.k[0], 0) &&
    equals(body.v.k[1], 0) &&
    equals(body.v.ij[0], 0) &&
    equals(body.v.ij[1], 0) &&
    equals(body.v.ij[2], 0) &&
    equals(body.v.ij[3], 0)
  )
}

export function simpleSpring(
  out: BodyQuad2d,
  start: Readonly<BodyQuad2d>,
  end: Readonly<Quad2d>,
  halflife: number,
  dt: number,
) {
  coreSimpleSpring(out.p.k, 0, out.v.k, 0, start.p.k[0], start.v.k[0], end.k[0], halflife, dt)
  coreSimpleSpring(out.p.k, 1, out.v.k, 1, start.p.k[1], start.v.k[1], end.k[1], halflife, dt)
  coreSimpleSpring(out.p.ij, 0, out.v.ij, 0, start.p.ij[0], start.v.ij[0], end.ij[0], halflife, dt)
  coreSimpleSpring(out.p.ij, 1, out.v.ij, 1, start.p.ij[1], start.v.ij[1], end.ij[1], halflife, dt)
  coreSimpleSpring(out.p.ij, 2, out.v.ij, 2, start.p.ij[2], start.v.ij[2], end.ij[2], halflife, dt)
  coreSimpleSpring(out.p.ij, 3, out.v.ij, 3, start.p.ij[3], start.v.ij[3], end.ij[3], halflife, dt)
}
