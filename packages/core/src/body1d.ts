import { Body } from './body'
import * as Spring from './spring'
import { glMatrix } from 'gl-matrix'

export interface Type extends Body<number> {}

export class Instance implements Type {
  p = 0
  v = 0
}

export function copy(out: Type, body: Readonly<Type>): Type {
  out.p = body.p
  out.v = body.v
  return out
}

export function set(out: Type, p?: number, v?: number): Type {
  out.p = p ?? out.p
  out.v = v ?? out.v
  return out
}

export function isAtRest(body: Readonly<Type>, p: number): boolean {
  return glMatrix.equals(body.p, p) && glMatrix.equals(body.v, 0)
}

export function criticalSpring(
  out: Type,
  start: Readonly<Type>,
  end: Readonly<Type>,
  halflife: number,
  dt: number,
) {
  Spring.criticalSpring(out, 'p', out, 'v', start.p, start.v, end.p, end.v, halflife, dt)
  return out
}
