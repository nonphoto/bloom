export class Clock {
  #time = performance.now();
  #deltaTime = 0;

  tick() {
    const nextTime = performance.now();
    this.#deltaTime = nextTime - this.#time;
    this.#time = nextTime;
  }

  get time() {
    return this.#time;
  }

  get deltaTime() {
    return this.#deltaTime;
  }
}
