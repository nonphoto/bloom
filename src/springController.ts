import { VecSpring } from "@nonphoto/spring";
import { Vec } from "@thi.ng/vectors";
import { continueSpring2, SpringOptions } from "./continueSpring";
import { Clock } from "./clock";
import { delay, springPosition2 } from "./transducer";
import { comp, Transducer } from "@thi.ng/transducers";

export class SpringController2 {
  #clock = new Clock();
  #spring: VecSpring | undefined;
  #position: Transducer<number, Vec> | undefined;

  constructor(start?: Vec, options?: SpringOptions) {
    this.next(start, options);
  }

  next(target: Vec | undefined, options?: SpringOptions) {
    this.#clock.tick();
    this.#spring = continueSpring2(
      this.#spring,
      target,
      this.#clock.deltaTime,
      options,
    );
    this.#position = this.#spring
      ? comp(delay(this.#clock.time), springPosition2(this.#spring))
      : undefined;
  }

  get spring() {
    return this.#spring;
  }

  get position() {
    return this.#position;
  }
}
