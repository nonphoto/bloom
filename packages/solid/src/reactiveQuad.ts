import { Quad } from '@chloranthy/core'
import { Accessor } from 'solid-js'
import { MaybeAccessor, createMaybeMemo } from './utils'

export class ReactiveQuad {
  value: Accessor<Quad | undefined>

  constructor(...args: Parameters<typeof createMaybeMemo>) {
    this.value = createMaybeMemo(...args)
  }

  static create(): ReactiveQuad {
    return new ReactiveQuad(Quad.create)
  }

  static fromDOMRect(source: MaybeAccessor<DOMRect>): ReactiveQuad {
    return new ReactiveQuad(Quad.fromDOMRect, source)
  }

  static fit(
    source: MaybeAccessor<Quad>,
    target: MaybeAccessor<Quad>,
    compare: (a: number, b: number) => number,
  ): ReactiveQuad {
    return new ReactiveQuad(Quad.fit, source, target, () => compare)
  }

  static contain(source: MaybeAccessor<Quad>, target: MaybeAccessor<Quad>): ReactiveQuad {
    return new ReactiveQuad(Quad.contain, source, target)
  }

  static cover(source: MaybeAccessor<Quad>, target: MaybeAccessor<Quad>): ReactiveQuad {
    return new ReactiveQuad(Quad.cover, source, target)
  }

  static copy(a: MaybeAccessor<Quad>): ReactiveQuad {
    return new ReactiveQuad(Quad.copy, a)
  }

  static zero(): ReactiveQuad {
    return new ReactiveQuad(Quad.zero)
  }

  fit(target: MaybeAccessor<Quad>, compare: (a: number, b: number) => number): ReactiveQuad {
    return new ReactiveQuad(Quad.fit, this.value, target, () => compare)
  }

  contain(target: MaybeAccessor<Quad>): ReactiveQuad {
    return new ReactiveQuad(Quad.contain, this.value, target)
  }

  cover(target: MaybeAccessor<Quad>): ReactiveQuad {
    return new ReactiveQuad(Quad.cover, this.value, target)
  }
}
