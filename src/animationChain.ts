function iteratorUnshift<T>(
  iterator: IterableIterator<T>,
  value: T,
): IterableIterator<T> {
  return (function* () {
    yield value;
    for (const result of iterator) {
      yield result;
    }
  })();
}

export class AnimationChain {
  currentAnimation: Animation;
  #chain: IterableIterator<Animation>;

  async run() {
    for (const animation of this.#chain) {
      this.currentAnimation = animation;
      animation.play();
      await animation.finished;
    }
  }

  interrupt() {
    this.currentAnimation = interruptAnimation(this.currentAnimation);
    this.#chain = iteratorUnshift(this.#chain, this.currentAnimation);
  }

  get finished() {
    try {
      return this.currentAnimation.finished;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
      }
    }
  }
}
