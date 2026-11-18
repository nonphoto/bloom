import { Transducer } from "@thi.ng/transducers";
import { animateKeyframes } from "./animateKeyframes";

export class SuspendableAnimation {
  #element: Element;
  #values: Transducer<number, Keyframe>;
  #animation: Animation | undefined;
  #suspended = false;

  constructor(element: Element, values: Transducer<number, Keyframe>) {
    this.#element = element;
    this.#values = values;
  }

  suspend(): void {
    this.#suspended = true;
    this.#animation?.cancel();
    this.#animation = undefined;
  }

  resume(): void {
    this.#suspended = false;
    this.#apply();
  }

  #apply(): void {
    if (!this.#suspended) {
      this.#animation?.cancel();
      this.#animation = animateKeyframes(this.#element, this.#values);
    }
  }
}
