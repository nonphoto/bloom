import { Quad } from '@chloranthy/animation'
import { Accessor, createMemo } from 'solid-js'
import { MaybeAccessor, access } from '@solid-primitives/utils'

export class ReactiveQuad {
  #instance = Quad.create()
  value: Accessor<Quad | undefined>

  constructor(fn: (out: Quad, ...args: any[]) => Quad, ...args: MaybeAccessor<any>[]) {
    this.value = createMemo<Quad | undefined>(
      prev => {
        const values = args.map(access)
        if (!values.some(value => value == null)) {
          return fn(prev ?? Quad.zero(this.#instance), ...values)
        }
      },
      undefined,
      { equals: false },
    )
  }

  static fromDOMRect(source: MaybeAccessor<DOMRect | undefined>): ReactiveQuad {
    return new ReactiveQuad(Quad.fromDOMRect, source)
  }
}
