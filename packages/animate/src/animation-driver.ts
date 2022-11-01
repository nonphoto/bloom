type AnimationDriverCallback = (
  time: DOMHighResTimeStamp,
  deltaTime: DOMHighResTimeStamp
) => void;

export default class AnimationDriver {
  private onUpdate: AnimationDriverCallback;
  private initialTime: DOMHighResTimeStamp;
  private currentTime: DOMHighResTimeStamp;
  private requestId?: number;

  constructor(onUpdate: AnimationDriverCallback) {
    this.onUpdate = onUpdate;
    this.update = this.update.bind(this);
    return this;
  }

  update(nextTime: DOMHighResTimeStamp) {
    this.initialTime ??= nextTime;
    this.currentTime ??= nextTime;
    this.requestId = requestAnimationFrame(this.update);
    this.onUpdate.call(
      undefined,
      nextTime - this.initialTime,
      nextTime - this.currentTime
    );
    this.currentTime = nextTime;
  }

  start() {
    if (this.requestId) {
      this.stop();
    }
    this.requestId = requestAnimationFrame(this.update);
  }

  stop() {
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }
    this.requestId = this.initialTime = this.currentTime = undefined;
  }
}
