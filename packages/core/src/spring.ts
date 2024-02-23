import { mix, square } from "./common";

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
5;

export function dampingRatioToStiffness(ratio: number, damping: number) {
  return square(damping / (ratio * 2));
}

export function dampingRatioToDamping(ratio: number, stiffness: number) {
  return ratio * 2 * Math.sqrt(stiffness);
}

export function damper(
  start: number,
  end: number,
  halflife: number,
  dt: number,
): number {
  return mix(
    start,
    end,
    1 - Math.exp(-(Math.LN2 * dt) / halflife),
  );
}

export function decayDamper(
  position: number,
  halflife: number,
  dt: number,
): number {
  return position * Math.exp(-(Math.LN2 * dt) / halflife);
}

export function springDuration(
  startPosition: number,
  startVelocity: number,
  endPosition: number,
  endVelocity: number,
  stiffness: number,
  damping: number,
  epsilon: number,
): number {
  const b = damping / 2;
  const c = endPosition + (damping * endVelocity) / stiffness;
  const d = startPosition - c;
  const w = Math.sqrt(stiffness - (damping * damping) / 4);
  const amplitude = Math.sqrt(
    square(startVelocity + b * d) / square(w) +
      square(d),
  );
  return -Math.log(epsilon / amplitude) / b;
}

export function springPosition(
  t: number,
  startPosition: number,
  startVelocity: number,
  endPosition: number,
  endVelocity: number,
  stiffness: number,
  damping: number,
): number {
  const halfDamping = damping / 2;
  const equilibrium = endPosition + (damping * endVelocity) / stiffness;
  const startDelta = startPosition - equilibrium;
  const frequency = Math.sqrt(stiffness - (damping * damping) / 4);
  const amplitude = Math.sign(startDelta) * Math.sqrt(
    square(startVelocity + halfDamping * startDelta) / square(frequency) +
      square(startDelta),
  );
  const phase = Math.atan(
    (startVelocity + startDelta * halfDamping) /
      (-startDelta * frequency),
  );
  return amplitude * Math.exp(-halfDamping * t) *
      Math.cos(frequency * t + phase) + equilibrium;
}
