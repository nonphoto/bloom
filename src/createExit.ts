import { createSubRoot } from "@solid-primitives/rootless";
import { createEffect, getOwner } from "solid-js";
import { Matcher } from "./matcher";
import { useUnmounted } from "./zombie";

export function createExit<T>(
  fn: (value: T | undefined) => void,
  matcher: Matcher<T, T>,
  value: T,
) {
  const unmounted = useUnmounted();
  const owner = getOwner();

  createEffect(() => {
    if (unmounted()) {
      matcher.attemptExit(
        value,
        (match) => {
          createSubRoot(() => {
            fn(match);
          }, owner);
        },
        () => {
          createSubRoot(() => {
            fn(undefined);
          }, owner);
        },
      );
    }
  });
}
