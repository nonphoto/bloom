// Copyright 2023 Jonas Luebbers

// Inspired by https://github.com/skevy/wobble

// Copyright 2017 Adam Miskiewicz

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

export interface SpringOptions {
  stiffness: number
  damping: number
  mass: number
  time: number
  startPosition: number
  endPosition: number
  startVelocity: number
  restVelocityThreshold: number
  restPositionThreshold: number
}

export class Spring {
  private _stiffness: number
  private _damping: number
  private _mass: number
  private _time: number
  private _position: number
  private _velocity: number
  private envelope: number
  private v0: number
  private x0: number
  private zeta: number
  private omega0: number
  private omega1: number
  private omega2: number

  startPosition: number
  endPosition: number
  startVelocity: number
  restVelocityThreshold: number
  restPositionThreshold: number

  constructor(options?: Partial<SpringOptions>) {
    this._stiffness = options?.stiffness ?? 100
    this._damping = options?.damping ?? 10
    this._mass = options?.mass ?? 1
    this._time = options?.time ?? 0
    this.startPosition = options?.startPosition ?? 0
    this.endPosition = options?.endPosition ?? 1
    this.startVelocity = options?.startVelocity ?? 0
    this.restVelocityThreshold = options?.restVelocityThreshold ?? 0.001
    this.restPositionThreshold = options?.restPositionThreshold ?? 0.001
    this._position = this.startPosition
    this._velocity = this.startVelocity
    this.envelope = this.v0 = this.x0 = this.zeta = this.omega0 = this.omega1 = this.omega2 = 0
  }

  set stiffness(value) {
    if (value <= 0) {
      throw Error('Stiffness must be greater than 0')
    }

    this._stiffness = value
  }

  get stiffness() {
    return this._stiffness
  }

  set damping(value) {
    if (value <= 0) {
      throw Error('Damping must be greater than 0')
    }

    this._damping = value
  }

  get damping() {
    return this._damping
  }

  set mass(value) {
    if (value <= 0) {
      throw Error('Mass must be greater than 0')
    }

    this._mass = value
  }

  get mass() {
    return this._mass
  }

  set time(value) {
    if (value < 0) {
      throw Error('Time must not be negative')
    }

    this._time = value
  }

  get time() {
    return this._time
  }

  get position() {
    return this.isAtRest ? this.endPosition : this._position
  }

  get velocity() {
    return this.isAtRest ? 0 : this._velocity
  }

  get isAtRest() {
    return (
      this.stiffness !== 0 &&
      Math.abs(this._velocity) <= this.restVelocityThreshold &&
      Math.abs(this.endPosition - this._position) <= this.restPositionThreshold
    )
  }

  get isOvershooting() {
    return this.startPosition < this.endPosition
      ? this._position > this.endPosition
      : this._position < this.endPosition
  }

  *frames() {
    this.time = 0
    this.update()
    yield this.position
    while (!this.isAtRest && this.time < 100_000) {
      this.time += 1_000 / 60
      this.update()
      yield this.position
    }
  }

  update() {
    this.v0 = -this.startVelocity
    this.x0 = this.endPosition - this.startPosition
    this.zeta = this.damping / (2 * Math.sqrt(this.stiffness * this.mass))
    this.omega0 = Math.sqrt(this.stiffness / this.mass) / 1000
    this.omega1 = this.omega0 * Math.sqrt(1.0 - this.zeta * this.zeta)
    this.omega2 = this.omega0 * Math.sqrt(this.zeta * this.zeta - 1.0)

    if (this.zeta < 1) {
      this.envelope = Math.exp(-this.zeta * this.omega0 * this.time)
      this._position =
        this.endPosition -
        this.envelope *
          (((this.v0 + this.zeta * this.omega0 * this.x0) / this.omega1) *
            Math.sin(this.omega1 * this.time) +
            this.x0 * Math.cos(this.omega1 * this.time))
      this._velocity =
        this.zeta *
          this.omega0 *
          this.envelope *
          ((Math.sin(this.omega1 * this.time) * (this.v0 + this.zeta * this.omega0 * this.x0)) /
            this.omega1 +
            this.x0 * Math.cos(this.omega1 * this.time)) -
        this.envelope *
          (Math.cos(this.omega1 * this.time) * (this.v0 + this.zeta * this.omega0 * this.x0) -
            this.omega1 * this.x0 * Math.sin(this.omega1 * this.time))
    } else if (this.zeta === 1) {
      this.envelope = Math.exp(-this.omega0 * this.time)
      this._position =
        this.endPosition - this.envelope * (this.x0 + (this.v0 + this.omega0 * this.x0) * this.time)
      this._velocity =
        this.envelope *
        (this.v0 * (this.time * this.omega0 - 1) +
          this.time * this.x0 * (this.omega0 * this.omega0))
    } else {
      this.envelope = Math.exp(-this.zeta * this.omega0 * this.time)
      this._position =
        this.endPosition -
        (this.envelope *
          ((this.v0 + this.zeta * this.omega0 * this.x0) * Math.sinh(this.omega2 * this.time) +
            this.omega2 * this.x0 * Math.cosh(this.omega2 * this.time))) /
          this.omega2
      this._velocity =
        (this.envelope *
          this.zeta *
          this.omega0 *
          (Math.sinh(this.omega2 * this.time) * (this.v0 + this.zeta * this.omega0 * this.x0) +
            this.x0 * this.omega2 * Math.cosh(this.omega2 * this.time))) /
          this.omega2 -
        (this.envelope *
          (this.omega2 *
            Math.cosh(this.omega2 * this.time) *
            (this.v0 + this.zeta * this.omega0 * this.x0) +
            this.omega2 * this.omega2 * this.x0 * Math.sinh(this.omega2 * this.time))) /
          this.omega2
    }
  }
}
