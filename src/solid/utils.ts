import { createSubRoot } from "@solid-primitives/rootless";
import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Vec } from "@thi.ng/vectors";
import {
  Accessor,
  createComputed,
  createMemo,
  createRenderEffect,
  EffectFunction,
  getOwner,
  on,
  Owner,
  runWithOwner,
} from "solid-js";

export function awaitWithOwner<T>(
  promise: Promise<T>,
  onFulfilled: (value: T) => void,
  onRejected?: () => void,
  owner: Owner | null = getOwner(),
): Promise<void> {
  return promise.then(
    (value) => {
      runWithOwner(owner, () => {
        onFulfilled(value);
      });
    },
    onRejected
      ? () => {
          runWithOwner(owner, onRejected);
        }
      : undefined,
  );
}

export function createOnce<T>(
  dep: Accessor<T>,
  fn: (value: NonNullable<T>) => void,
) {
  const owner = getOwner();
  createSubRoot((dispose) => {
    createComputed(
      on(dep, (value) => {
        if (value) {
          createSubRoot(() => {
            fn(value);
          }, owner);
          dispose();
        }
      }),
    );
  });
}

export function createVec(fn: EffectFunction<Vec>): Accessor<Vec> {
  return createMemo(fn, [], { equals: false });
}

export function createLog<T>(value: MaybeAccessor<T>, ...args: any[]) {
  createRenderEffect(() => {
    console.log(access(value), ...args);
  });
}
