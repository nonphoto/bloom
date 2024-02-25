import { square } from "./common";

export function halflifeToDamping(halflife: number) {
  return (4 * Math.LN2) / halflife;
}

export function dampingToHalflife(damping: number) {
  return (4 * Math.LN2) / damping;
}

export function frequencyToStiffness(frequency: number) {
  return square(2 * Math.PI * frequency);
}

export function stiffnessToFrequency(stiffness: number) {
  return Math.sqrt(stiffness) / (2 * Math.PI);
}

export function criticalHalflife(frequency: number) {
  return dampingToHalflife(Math.sqrt(frequencyToStiffness(frequency) * 4));
}

export function criticalFrequency(halflife: number) {
  return stiffnessToFrequency(square(halflifeToDamping(halflife)) / 4);
}

export function dampingRatioToStiffness(ratio: number, damping: number) {
  return square(damping / (ratio * 2));
}

export function dampingRatioToDamping(ratio: number, stiffness: number) {
  return ratio * 2 * Math.sqrt(stiffness);
}

export function toDampingRatio(damping: number, stiffness: number) {
  return stiffness - square(damping) / 4;
}

export interface Spring {
  damping: number;
  start: number;
  end: number;
  startVelocity: number;
  dampedFrequency: number;
  amplitude: number;
  phase: number;
}

export function springCreate(options: {
  start?: number;
  end?: number;
  startVelocity?: number;
  dampingRatio?: number;
  halflife?: number;
}): Spring {
  const dampingRatio = Math.min(options.dampingRatio ?? 1, 0.999);
  const damping = options.halflife ? halflifeToDamping(options.halflife) : 10;
  const stiffness = dampingRatioToStiffness(dampingRatio, damping);
  const start = options.start ?? 0;
  const end = options.end ?? 1;
  const startVelocity = options.startVelocity ?? 0;
  const delta = start - end;
  const velocityDelta = startVelocity + delta * damping * 0.5;
  const dampedFrequency = Math.sqrt(stiffness - square(damping) / 4);
  const amplitude = Math.sign(delta) * Math.sqrt(
    square(velocityDelta) / square(dampedFrequency) +
      square(delta),
  );
  const phase = Math.atan(
    velocityDelta /
      (-delta * dampedFrequency),
  );

  return {
    start,
    end,
    damping,
    startVelocity,
    dampedFrequency,
    amplitude,
    phase,
  };
}

export function springPosition(s: Spring, t: number) {
  const delta = s.start - s.end;
  const halfDamping = s.damping * 0.5;
  const exp = Math.exp(-halfDamping * t);
  return s.dampedFrequency > 0
    ? s.amplitude * exp *
        Math.cos(s.dampedFrequency * t + s.phase) + s.end
    : exp * (delta + (s.startVelocity + delta * halfDamping) * t) +
      s.end;
}

export function springVelocity(s: Spring, t: number) {
  const delta = s.start - s.end;
  const halfDamping = s.damping * 0.5;
  const exp = Math.exp(-halfDamping * t);
  const theta = s.dampedFrequency * t + s.phase;
  return s.dampedFrequency > 0
    ? -halfDamping * s.amplitude * exp * Math.cos(theta) -
      s.dampedFrequency * s.amplitude * exp * Math.sin(theta)
    : exp *
      (s.startVelocity -
        (s.startVelocity + delta * halfDamping) * halfDamping * t);
}

export function springDuration(s: Spring, epsilon: number = 1e-5) {
  const delta = s.start - s.end;
  const halfDamping = s.damping * 0.5;
  return -Math.log(
    Math.sign(delta) * epsilon / s.amplitude,
  ) / halfDamping;
}
