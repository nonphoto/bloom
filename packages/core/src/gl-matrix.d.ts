declare module 'gl-matrix/esm/vec2.js' {
  import { vec2 } from 'gl-matrix'
  export = vec2
}

declare module 'gl-matrix/esm/mat2.js' {
  import { mat2 } from 'gl-matrix'
  export = mat2
}

declare module 'gl-matrix/esm/common.js' {
  export function equals(a: number, b: number): boolean
}
