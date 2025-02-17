import { createSubRoot } from "@solid-primitives/rootless";
import { noop } from "@solid-primitives/utils";
import { getOwner, Owner } from "solid-js";
import { Matcher } from "./matcher";
import { useUnmounted } from "./zombie";

interface PresenceMatcherOptions<T> {
  onEnterSuccess?: (value: T) => void;
  onEnterFailure?: (value: void) => void;
  onExitSuccess?: (value: T) => void;
  onExitFailure?: (value: void) => void;
}

export function createPresenceMatcher<T>(
  matcher: Matcher<T, T>,
  value: T,
  options?: PresenceMatcherOptions<T>,
) {
  const owner = getOwner();
  const unmounted = useUnmounted();
  matcher.attemptEnter(
    value,
    options?.onEnterSuccess
      ? withCreateSubRoot(options.onEnterSuccess, owner)
      : noop,
    options?.onEnterFailure
      ? withCreateSubRoot(options.onEnterFailure, owner)
      : noop,
  );
}

function withCreateSubRoot<T>(fn: (value: T) => void, owner: Owner | null) {
  return (value: T) => {
    createSubRoot(() => {
      fn(value);
    }, owner);
  };
}
