import { Quad2d, Rect } from '@chloranthy/core'
import { Accessor } from 'solid-js'
import { MaybeAccessor, createMaybeMemo } from './utils'

export class ReactiveQuad2d {
  value: Accessor<Quad2d.Type | undefined>

  constructor(...args: Parameters<typeof createMaybeMemo>) {
    this.value = createMaybeMemo(...args)
  }

  static create(): ReactiveQuad2d {
    return new ReactiveQuad2d(Quad2d.create)
  }

  static fromRect(source: MaybeAccessor<Rect.Type>): ReactiveQuad2d {
    return new ReactiveQuad2d(Quad2d.fromRect, source)
  }

  static fit(
    source: MaybeAccessor<Quad2d.Type>,
    target: MaybeAccessor<Quad2d.Type>,
    compare: (a: number, b: number) => number,
  ): ReactiveQuad2d {
    return new ReactiveQuad2d(Quad2d.fit, source, target, () => compare)
  }

  static contain(
    source: MaybeAccessor<Quad2d.Type>,
    target: MaybeAccessor<Quad2d.Type>,
  ): ReactiveQuad2d {
    return new ReactiveQuad2d(Quad2d.contain, source, target)
  }

  static cover(
    source: MaybeAccessor<Quad2d.Type>,
    target: MaybeAccessor<Quad2d.Type>,
  ): ReactiveQuad2d {
    return new ReactiveQuad2d(Quad2d.cover, source, target)
  }

  fit(
    target: MaybeAccessor<Quad2d.Type>,
    compare: (a: number, b: number) => number,
  ): ReactiveQuad2d {
    return new ReactiveQuad2d(Quad2d.fit, this.value, target, () => compare)
  }

  contain(target: MaybeAccessor<Quad2d.Type>): ReactiveQuad2d {
    return new ReactiveQuad2d(Quad2d.contain, this.value, target)
  }

  cover(target: MaybeAccessor<Quad2d.Type>): ReactiveQuad2d {
    return new ReactiveQuad2d(Quad2d.cover, this.value, target)
  }
}
