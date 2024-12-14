function next<T>(iterator: Iterator<T>): T | undefined {
  const { done, value } = iterator.next();
  return done ? undefined : value;
}

interface Interruption {
  currentTime: CSSNumberish | null;
  playState: AnimationPlayState;
}

export interface AnimationChainChangeEventDetail {
  prev: Animation;
  next: Animation;
}

export class AnimationChain extends EventTarget {
  #iterator: Iterator<Animation>;
  #interruption: Interruption | null = null;
  animation: Animation;

  constructor(animation: Iterator<Animation> | Animation) {
    super();
    if (animation instanceof Animation) {
      this.#iterator = [][Symbol.iterator]();
      this.animation = animation;
    } else {
      this.#iterator = animation;
      this.animation = next(animation) ?? new Animation();
    }
  }

  #change(nextAnimation: Animation) {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { prev: this.animation, next: nextAnimation },
      }),
    );
    this.animation = nextAnimation;
  }

  play() {
    this.animation.play();
    this.animation.addEventListener(
      "finish",
      () => {
        const nextAnimation = this.#iterator ? next(this.#iterator) : undefined;
        if (nextAnimation) {
          this.#change(nextAnimation);
          this.play();
        } else {
          this.dispatchEvent(new Event("finish"));
        }
      },
      { once: true },
    );
  }

  cancel() {
    this.animation.cancel();
  }

  interrupt() {
    const { currentTime, timeline, effect, playState } = this.animation;
    this.#interruption = { currentTime, playState };
    this.animation.cancel();
    this.#change(new Animation(effect, timeline));
  }

  resume() {
    if (this.#interruption) {
      this.animation.currentTime = this.#interruption.currentTime;
      if (this.#interruption.playState === "running") {
        this.play();
      }
      this.#interruption = null;
    }
  }

  get finished() {
    return new Promise((resolve, reject) => {
      this.addEventListener("finish", resolve, { once: true });
      this.addEventListener("cancel", reject, { once: true });
    });
  }
}
