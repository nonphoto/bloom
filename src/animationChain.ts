import { interruptAnimation } from "./interruptAnimation";

function next<T>(iterator: Iterator<T>): T | undefined {
  const { done, value } = iterator.next();
  return done ? undefined : value;
}

export class AnimationChain extends EventTarget {
  #iterator: Iterator<Animation>;
  animation: Animation | undefined;

  constructor(iterator: Iterator<Animation>) {
    super();
    this.#iterator = iterator;
    this.animation = next(iterator);
  }

  play() {
    if (this.animation) {
      this.animation.play();
      this.animation.addEventListener(
        "finish",
        () => {
          this.animation = next(this.#iterator);
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
      this.animation = interruptAnimation(this.animation);
    }
  }

  get finished() {
    return new Promise((resolve, reject) => {
      this.addEventListener("finish", resolve, { once: true });
      this.addEventListener("cancel", reject, { once: true });
    });
  }
}
