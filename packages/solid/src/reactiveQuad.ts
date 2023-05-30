import { Quad } from '@chloranthy/animation'
import { Accessor } from 'solid-js'
import { Maybe, createMaybeMemo } from './utils'

export class ReactiveQuad {
  value: Accessor<Quad | undefined>

  constructor(...args: Parameters<typeof createMaybeMemo>) {
    this.value = createMaybeMemo(...args)
  }

  static create(): ReactiveQuad {
    return new ReactiveQuad(Quad.create)
  }

  static fromDOMRect(source: Maybe<DOMRect>): ReactiveQuad {
    return new ReactiveQuad(Quad.fromDOMRect, source)
  }

  static fit(
    source: Maybe<Quad>,
    target: Maybe<Quad>,
    compare: (a: number, b: number) => number,
  ): ReactiveQuad {
    return new ReactiveQuad(Quad.fit, source, target, () => compare)
  }

  static contain(source: Maybe<Quad>, target: Maybe<Quad>): ReactiveQuad {
    return new ReactiveQuad(Quad.contain, source, target)
  }

  static cover(source: Maybe<Quad>, target: Maybe<Quad>): ReactiveQuad {
    return new ReactiveQuad(Quad.cover, source, target)
  }

  static copy(a: Maybe<Quad>): ReactiveQuad {
    return new ReactiveQuad(Quad.copy, a)
  }

  static zero(): ReactiveQuad {
    return new ReactiveQuad(Quad.zero)
  }

  fit(target: Maybe<Quad>, compare: (a: number, b: number) => number): ReactiveQuad {
    return new ReactiveQuad(Quad.fit, this.value, target, () => compare)
  }

  contain(target: Maybe<Quad>): ReactiveQuad {
    return new ReactiveQuad(Quad.contain, this.value, target)
  }

  cover(target: Maybe<Quad>): ReactiveQuad {
    return new ReactiveQuad(Quad.cover, this.value, target)
  }
}
