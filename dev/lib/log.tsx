import { Accessor, createEffect } from "solid-js";

export function createLog<T>(prefix: string, accessor: Accessor<T>): void {
  createEffect(
    () => accessor(),
    (value) => console.log(prefix, value),
  );
}
