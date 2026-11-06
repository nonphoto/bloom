import { VecSpring } from "@nonphoto/spring";
import { Vec } from "@thi.ng/vectors";
import { continueSpring2, SpringOptions } from "./continueSpring";
import { Clock } from "./clock";

export class SpringController2 {
  #clock = new Clock();
  #spring: VecSpring | undefined;

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
  }

  get spring() {
    return this.#spring;
  }
}
