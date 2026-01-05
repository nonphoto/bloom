import { createSubRoot } from "@solid-primitives/rootless";
import { getOwner, Owner } from "solid-js";
import { Matcher } from "./matcher";

export function createEnterSubRoot<T>(
  onSuccess: (value: T) => void,
  onFailure: () => void,
  matcher: Matcher<T, T>,
  value: T,
  owners: (Owner | null)[] = [getOwner()],
) {
  matcher.attemptEnter(
    value,
    (match) => {
      createSubRoot(
        () => {
          onSuccess(match);
        },
        ...owners,
      );
    },
    () => {
      createSubRoot(
        () => {
          onFailure();
        },
        ...owners,
      );
    },
  );
}

export function createExitSubRoot<T>(
  onSuccess: (value: T) => void,
  onFailure: () => void,
  matcher: Matcher<T, T>,
  value: T,
  owners: (Owner | null)[] = [getOwner()],
) {
  matcher.attemptExit(
    value,
    (match) => {
      createSubRoot(
        () => {
          onSuccess(match);
        },
        ...owners,
      );
    },
    () => {
      createSubRoot(
        () => {
          onFailure();
        },
        ...owners,
      );
    },
  );
}
