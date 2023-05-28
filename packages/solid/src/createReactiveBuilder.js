function mapObject(object, fn) {
  return Object.fromEntries(Object.entries(object).map(fn))
}

export function createReactiveBuilder(ops) {
  const constructor = class {
    constructor(fn, ...args) {
      this.value = createMemo(
        prev => {
          const values = [this, ...args].map(access)
          if (!values.some(value => value == null)) {
            return fn(prev, ...values)
          }
        },
        undefined,
        { equals: false },
      )

      return Object.assign(() => value(), this)
    }
  }

  return Object.assign(
    constructor.prototype,
    mapObject(ops, ([key, value]) => {
      if (typeof value === 'function') {
        prototype[key] = function (...args) {
          new constructor(value, ...args)
        }
      }
    }),
  )
}
