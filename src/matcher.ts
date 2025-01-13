import { Batcher } from "./batcher";

export type MatcherAttempt<T, U> = {
  value: T;
  onSuccess: (value: U) => void;
  onFailure: () => void;
};

export class Matcher<Enter, Exit = Enter> {
  #entering = new Set<MatcherAttempt<Enter, Exit>>();
  #exiting = new Set<MatcherAttempt<Exit, Enter>>();
  #batcher = new Batcher();

  constructor() {
    this.#batcher.addEventListener("prerun", () => {
      const [enteringHead, ...enteringTail] = this.#entering.values();
      const [exitingHead, ...exitingTail] = this.#exiting.values();

      if (enteringHead && exitingHead) {
        enteringHead.onSuccess(exitingHead.value);
        exitingHead.onSuccess(enteringHead.value);
      } else {
        enteringHead?.onFailure();
        exitingHead?.onFailure();
      }

      for (const attempt of enteringTail) {
        attempt.onFailure();
      }

      for (const attempt of exitingTail) {
        attempt.onFailure();
      }
    });

    this.#batcher.addEventListener("postrun", () => {
      this.#entering.clear();
      this.#exiting.clear();
    });
  }

  #attempt<Send, Receive>(
    value: Send,
    set: Set<MatcherAttempt<Send, Receive>>,
    onSuccess: (value: Receive) => void,
    onFailure: () => void,
  ): void {
    set.add({ value, onSuccess, onFailure });
    this.#batcher.enqueue();
  }

  attemptEnter(
    value: Enter,
    onSuccess: (value: Exit) => void,
    onFailure: () => void,
  ): void {
    this.#attempt(value, this.#entering, onSuccess, onFailure);
  }

  attemptExit(
    value: Exit,
    onSuccess: (value: Enter) => void,
    onFailure: () => void,
  ): void {
    this.#attempt(value, this.#exiting, onSuccess, onFailure);
  }
}
