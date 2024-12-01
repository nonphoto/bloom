export function interruptAnimation(animation: Animation): Animation {
  const { startTime, currentTime, timeline, effect } = animation;
  animation.cancel();
  const next = new Animation(effect, timeline);
  next.startTime = startTime;
  next.currentTime = currentTime;
  return next;
}
