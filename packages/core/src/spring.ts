import { square } from "./ease";

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
	halfDamping: number;
	start: number;
	end: number;
	delta: number;
	startVelocity: number;
	dampedFrequency: number;
	amplitude: number;
	phase: number;
}

export interface SpringOptions {
	start: number;
	end: number;
	startVelocity: number;
	dampingRatio: number;
	halflife: number;
}

export function springCreate(options: Partial<SpringOptions>): Spring {
	const dampingRatio = Math.min(options.dampingRatio ?? 1, 0.999);
	const damping = options.halflife ? halflifeToDamping(options.halflife) : 10;
	const stiffness = dampingRatioToStiffness(dampingRatio, damping);
	const start = options.start ?? 0;
	const end = options.end ?? 1;
	const startVelocity = options.startVelocity ?? 0;
	const delta = start - end;
	const velocityDelta = startVelocity + delta * damping * 0.5;
	const dampedFrequency = Math.sqrt(stiffness - square(damping) / 4);
	const amplitude =
		Math.sign(delta) *
		Math.sqrt(square(velocityDelta) / square(dampedFrequency) + square(delta));
	const phase = Math.atan(velocityDelta / (-delta * dampedFrequency));
	const halfDamping = damping / 2;

	return {
		start,
		end,
		delta,
		halfDamping,
		startVelocity,
		dampedFrequency,
		amplitude,
		phase: isNaN(phase) ? 0 : phase,
	};
}

export function springPosition(s: Spring, t: number) {
	const exp = Math.exp(-s.halfDamping * t);
	return s.delta === 0
		? s.end
		: s.dampedFrequency > 0
			? s.amplitude * exp * Math.cos(s.dampedFrequency * t + s.phase) + s.end
			: exp * (s.delta + (s.startVelocity + s.delta * s.halfDamping) * t) +
				s.end;
}

export function springVelocity(s: Spring, t: number) {
	const exp = Math.exp(-s.halfDamping * t);
	const theta = s.dampedFrequency * t + s.phase;
	return s.dampedFrequency > 0
		? -s.halfDamping * s.amplitude * exp * Math.cos(theta) -
				s.dampedFrequency * s.amplitude * exp * Math.sin(theta)
		: exp *
				(s.startVelocity -
					(s.startVelocity + s.delta * s.halfDamping) * s.halfDamping * t);
}

export function springDuration(s: Spring, epsilon: number) {
	const duration =
		-Math.log((Math.sign(s.delta) * epsilon) / s.amplitude) / s.halfDamping;
	return isNaN(duration) ? 0 : duration;
}
