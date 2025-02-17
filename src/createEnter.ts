import { createSubRoot } from "@solid-primitives/rootless";
import { getOwner } from "solid-js";
import { Matcher } from "./matcher";

export function createEnter<T>(
  fn: (value: T | undefined) => void,
  matcher: Matcher<T, T>,
  value: T,
) {
  const owner = getOwner();
  matcher.attemptEnter(
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
