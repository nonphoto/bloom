export type Easing = (t: number) => number;

const linear: Easing = (t) => t;

export type BehaviorKeyframe<T> = T | {
  value: T;
  offset: number;
  easing: Easing;
  composite: CompositeOperationOrAuto;
};

export type Behavior<T> = Iterator<{
  keyframes: BehaviorKeyframe<T>[];
  startTime: number;
  duration: number;
  easing: Easing;
}>;

export const time: () => Behavior<number> = function* () {
  const interval = 100_000;
  for (let i = 0; i < Infinity; i += interval) {
    yield {
      keyframes: [i, i + interval],
      startTime: i,
      duration: interval,
      easing: linear,
    };
  }
};
