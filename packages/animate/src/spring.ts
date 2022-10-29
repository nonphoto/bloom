export interface SpringOptions {
  stiffness: number;
  damping: number;
  mass: number;
  initialPosition: number;
  targetPosition: number;
  initialVelocity: number;
  restVelocityThreshold: number;
  restPositionThreshold: number;
}

export default class Spring {
  private _options: SpringOptions;
  private _computed: {
    v0: number;
    x0: number;
    zeta: number;
    omega0: number;
    omega1: number;
    omega2: number;
  };
  private _state: {
    position: number;
    velocity: number;
    envelope: number;
  };

  constructor(options?: Partial<SpringOptions>) {
    const {
      stiffness = 100,
      damping = 10,
      mass = 1,
      initialPosition = 0,
      targetPosition = 1,
      initialVelocity = 0,
      restVelocityThreshold = 0.001,
      restPositionThreshold = 0.001,
    } = options ?? {};

    if (mass <= 0) {
      throw Error("Mass must be greater than 0");
    }

    if (stiffness <= 0) {
      throw Error("Stiffness must be greater than 0");
    }

    if (damping <= 0) {
      throw Error("Damping must be greater than 0");
    }

    const v0 = -initialVelocity,
      x0 = targetPosition - initialPosition,
      zeta = damping / (2 * Math.sqrt(stiffness * mass)),
      omega0 = Math.sqrt(stiffness / mass) / 1000,
      omega1 = omega0 * Math.sqrt(1.0 - zeta * zeta),
      omega2 = omega0 * Math.sqrt(zeta * zeta - 1.0);

    this._options = Object.freeze({
      stiffness,
      damping,
      mass,
      initialPosition,
      targetPosition,
      initialVelocity,
      restVelocityThreshold,
      restPositionThreshold,
    });
    this._computed = Object.freeze({ v0, x0, zeta, omega0, omega1, omega2 });
    this._state = {
      position: this._options.initialPosition,
      velocity: this._options.initialVelocity,
      envelope: 0,
    };
  }

  get position() {
    return this.isAtRest ? this._options.targetPosition : this._state.position;
  }

  get velocity() {
    return this.isAtRest ? 0 : this._state.velocity;
  }

  get isAtRest() {
    return (
      this._options.stiffness !== 0 &&
      Math.abs(this._state.velocity) <= this._options.restVelocityThreshold &&
      Math.abs(this._options.targetPosition - this._state.position) <=
        this._options.restPositionThreshold
    );
  }

  get isOvershooting() {
    return this._options.initialPosition < this._options.targetPosition
      ? this._state.position > this._options.targetPosition
      : this._state.position < this._options.targetPosition;
  }

  setTime(t: number) {
    if (this._computed.zeta < 1) {
      this._state.envelope = Math.exp(
        -this._computed.zeta * this._computed.omega0 * t
      );
      this._state.position =
        this._options.targetPosition -
        this._state.envelope *
          (((this._computed.v0 +
            this._computed.zeta * this._computed.omega0 * this._computed.x0) /
            this._computed.omega1) *
            Math.sin(this._computed.omega1 * t) +
            this._computed.x0 * Math.cos(this._computed.omega1 * t));
      this._state.velocity =
        this._computed.zeta *
          this._computed.omega0 *
          this._state.envelope *
          ((Math.sin(this._computed.omega1 * t) *
            (this._computed.v0 +
              this._computed.zeta *
                this._computed.omega0 *
                this._computed.x0)) /
            this._computed.omega1 +
            this._computed.x0 * Math.cos(this._computed.omega1 * t)) -
        this._state.envelope *
          (Math.cos(this._computed.omega1 * t) *
            (this._computed.v0 +
              this._computed.zeta * this._computed.omega0 * this._computed.x0) -
            this._computed.omega1 *
              this._computed.x0 *
              Math.sin(this._computed.omega1 * t));
    } else if (this._computed.zeta === 1) {
      this._state.envelope = Math.exp(-this._computed.omega0 * t);
      this._state.position =
        this._options.targetPosition -
        this._state.envelope *
          (this._computed.x0 +
            (this._computed.v0 + this._computed.omega0 * this._computed.x0) *
              t);
      this._state.velocity =
        this._state.envelope *
        (this._computed.v0 * (t * this._computed.omega0 - 1) +
          t *
            this._computed.x0 *
            (this._computed.omega0 * this._computed.omega0));
    } else {
      this._state.envelope = Math.exp(
        -this._computed.zeta * this._computed.omega0 * t
      );
      this._state.position =
        this._options.targetPosition -
        (this._state.envelope *
          ((this._computed.v0 +
            this._computed.zeta * this._computed.omega0 * this._computed.x0) *
            Math.sinh(this._computed.omega2 * t) +
            this._computed.omega2 *
              this._computed.x0 *
              Math.cosh(this._computed.omega2 * t))) /
          this._computed.omega2;
      this._state.velocity =
        (this._state.envelope *
          this._computed.zeta *
          this._computed.omega0 *
          (Math.sinh(this._computed.omega2 * t) *
            (this._computed.v0 +
              this._computed.zeta * this._computed.omega0 * this._computed.x0) +
            this._computed.x0 *
              this._computed.omega2 *
              Math.cosh(this._computed.omega2 * t))) /
          this._computed.omega2 -
        (this._state.envelope *
          (this._computed.omega2 *
            Math.cosh(this._computed.omega2 * t) *
            (this._computed.v0 +
              this._computed.zeta * this._computed.omega0 * this._computed.x0) +
            this._computed.omega2 *
              this._computed.omega2 *
              this._computed.x0 *
              Math.sinh(this._computed.omega2 * t))) /
          this._computed.omega2;
    }
  }
}
