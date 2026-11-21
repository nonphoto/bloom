export interface Clock {
  time: number;
  deltaTime: number;
}

export function create(): Clock {
  return { time: performance.now(), deltaTime: 0 };
}

export function tick(clock: Clock): Clock {
  const time = performance.now();
  return { time, deltaTime: time - clock.time };
}
