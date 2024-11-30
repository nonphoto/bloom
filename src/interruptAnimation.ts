function interruptAnimation(animation: Animation): Animation {
  const { startTime, currentTime, timeline, effect } = animation;
  animation.cancel();
  const next = new Animation(effect, timeline);
  animation.startTime = startTime;
  animation.currentTime = currentTime;
  return next;
}
