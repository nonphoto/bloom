function next<T>(iterator: Iterator<T>): T | undefined {
  const { done, value } = iterator.next();
  return done ? undefined : value;
}

interface Interruption {
  currentTime: CSSNumberish | null;
  playState: AnimationPlayState;
}

export class AnimationChain extends EventTarget {
  #iterator: Iterator<Animation> | null = null;
  #interruption: Interruption | null = null;
  animation: Animation | undefined;

  constructor(animation: Iterator<Animation> | Animation) {
    super();
    if (animation instanceof Animation) {
      this.#iterator = null;
      this.animation = animation;
    } else {
      this.#iterator = animation;
      this.animation = next(animation);
    }
  }

  play() {
    if (this.animation) {
      if (this.#interruption) {
        this.#interruption = null;
      }
      this.animation.play();
      this.animation.addEventListener(
        "finish",
        () => {
          this.animation = this.#iterator ? next(this.#iterator) : undefined;
          if (this.animation) {
            this.play();
          } else {
            this.dispatchEvent(new Event("finish"));
          }
        },
        { once: true },
      );
    }
  }

  interrupt() {
    if (this.animation) {
      const { currentTime, timeline, effect, playState } = this.animation;
      this.#interruption = { currentTime, playState };
      this.animation.cancel();
      this.animation = new Animation(effect, timeline);
    }
  }

  resume() {
    if (this.animation && this.#interruption) {
      this.animation.currentTime = this.#interruption.currentTime;
      if (this.#interruption.playState === "running") {
        this.play();
      }
    }
  }

  get finished() {
    return new Promise((resolve, reject) => {
      this.addEventListener("finish", resolve, { once: true });
      this.addEventListener("cancel", reject, { once: true });
    });
  }
}
