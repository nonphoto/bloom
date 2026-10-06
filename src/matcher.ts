type MatcherAttempt<T, U> = {
  value: T;
  callback: (match?: U) => void;
};

export class Matcher<Enter, Exit = Enter> {
  #entering = new Set<MatcherAttempt<Enter, Exit>>();
  #exiting = new Set<MatcherAttempt<Exit, Enter>>();

  constructor() {}

  flush() {
    const [enteringHead, ...enteringTail] = this.#entering.values();
    const [exitingHead, ...exitingTail] = this.#exiting.values();

    enteringHead?.callback(exitingHead?.value);
    exitingHead?.callback(enteringHead?.value);

    for (const attempt of [...enteringTail, ...exitingTail]) {
      attempt.callback();
    }

    this.#entering.clear();
    this.#exiting.clear();
  }

  #attempt<Send, Receive>(
    value: Send,
    set: Set<MatcherAttempt<Send, Receive>>,
    callback: (value?: Receive) => void,
  ): void {
    set.add({ value, callback });
  }

  attemptEnter(value: Enter, callback: (match?: Exit) => void): void {
    this.#attempt(value, this.#entering, callback);
  }

  attemptExit(value: Exit, callback: (match?: Enter) => void): void {
    this.#attempt(value, this.#exiting, callback);
  }
}
