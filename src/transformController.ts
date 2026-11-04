import { Transducer } from "@thi.ng/transducers";
import { Mat } from "@thi.ng/matrices";
import { animateTransform } from "./animateTransform";

export class TransformController {
  #element: HTMLElement;
  #transform: Transducer<number, Mat> | undefined;
  #animation: Animation | undefined;
  #enabled = true;

  constructor(element: HTMLElement) {
    this.#element = element;
  }

  cancel(): void {
    this.#animation?.cancel();
    this.#transform = undefined;
    this.#animation = undefined;
  }

  disable(): void {
    this.#enabled = false;
    this.#animation?.cancel();
    this.#animation = undefined;
  }

  enable(): void {
    this.#enabled = true;
    this.#apply();
  }

  animate(transform: Transducer<number, Mat>): Animation | undefined {
    this.#transform = transform;
    if (this.#enabled) {
      this.#apply();
    }
    return this.#animation;
  }

  #apply() {
    if (this.#transform) {
      this.#animation = animateTransform(this.#element, this.#transform);
    }
  }
}
