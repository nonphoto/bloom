type AxisShaped<T> = {
  p: T
  v: T
}

export type PropertyDescriptorMethods<T, U> = {
  get: (out: T, source: U) => T
  set: (out: U, derived: T) => U
}

export function createPropertyDescriptor<T, U>(
  derived: T,
  source: U,
  methods: PropertyDescriptorMethods<T, U>,
) {
  return {
    get() {
      return methods.get(derived, source)
    },
    set(nextValue: T) {
      return methods.set(source, nextValue)
    },
  }
}

export function createDerived<T, U, V extends AxisShaped<T>, W extends AxisShaped<U>>(
  derived: V,
  source: W,
  descriptor: PropertyDescriptorMethods<T, U>,
) {
  return Object.defineProperties(derived, {
    p: createPropertyDescriptor(derived.p, source.p, descriptor),
    v: createPropertyDescriptor(derived.v, source.v, descriptor),
  })
}
