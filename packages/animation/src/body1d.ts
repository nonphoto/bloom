import { Body } from './body'
import { Spring } from './spring'
import { defaultEpsilon } from './utils'

export namespace Body1d {
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

  export function isAtRest(body: Readonly<Type>, epsilon = defaultEpsilon): boolean {
    return Math.abs(body.p) <= epsilon && Math.abs(body.v) <= epsilon
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
}
