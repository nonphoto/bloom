import { glMatrix } from "gl-matrix";

export type ArrayType = InstanceType<typeof glMatrix.ARRAY_TYPE>;

export type Mat2d = ArrayType & { length: 6 };
export type Vec2 = ArrayType & { length: 2 };
