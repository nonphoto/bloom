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
    this.stiffness = options?.stiffness ?? 100
    this.damping = options?.damping ?? 10
    this.mass = options?.mass ?? 1
    this.time = options?.time ?? 0
    this.startPosition = options?.startPosition ?? 0
    this.endPosition = options?.endPosition ?? 1
    this.startVelocity = options?.startVelocity ?? 0
    this.restVelocityThreshold = options?.restVelocityThreshold ?? 0.001
    this.restPositionThreshold = options?.restPositionThreshold ?? 0.001
    this._position = this.startPosition
    this._velocity = this.startVelocity
    this.envelope = 0
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
