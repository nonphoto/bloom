import {
  Spring,
  duration as springDuration,
  positionAt as springPositionAt,
} from "@nonphoto/spring";
import { Properties } from "csstype";

export type Moment<T> = [T, number, number];

export type Behavior<T> = (t: number) => T;

export type MomentBehavior<T> = Behavior<Moment<T>>;

export type Functor<T, U> = (t: T) => U;

export type BehaviorFunctor<T, U> = Functor<Behavior<T>, Behavior<U>>;

export type MomentBehaviorFunctor<T, U> = Functor<
  MomentBehavior<T>,
  MomentBehavior<U>
>;

export function time(t: number): Moment<number> {
  return [t, 0, Infinity];
}

export const duration: <T>(ms: number) => MomentBehaviorFunctor<T, T> =
  (ms) => (b) => (t) => {
    const [value, start] = b(t);
    return [value, start, start + ms];
  };

export const delay: <T>(ms: number) => MomentBehaviorFunctor<T, T> =
  (ms) => (b) => (t) => {
    const [value, start, end] = b(t - ms);
    return [value, start + ms, end + ms];
  };

export const value: <T>(b: MomentBehavior<T>) => Behavior<T> = (b) => (t) =>
  b(t)[0];

export const map: <T, U>(fn: Functor<T, U>) => BehaviorFunctor<T, U> =
  (fn) => (b) => (t) =>
    fn(b(t));

export const mapMoment: <T, U>(
  fn: Functor<T, U>,
) => MomentBehaviorFunctor<T, U> = (fn) =>
  map(([value, start, end]) => [fn(value), start, end]);

export const keyframes: <T extends keyof Properties>(
  key: T,
) => BehaviorFunctor<Properties[T], Keyframe> = (key) =>
  map((value) => ({
    [key]: value,
  }));

export const springPosition: (
  s: Spring,
  epsilon?: number,
) => MomentBehavior<number> = (s, epsilon) =>
  mapMoment<number, number>((t) => springPositionAt(s, t))(
    duration<number>(springDuration(s, epsilon))(time),
  );
