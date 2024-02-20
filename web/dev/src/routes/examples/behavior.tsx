import {
  Behavior,
  rangeUnion,
  toAnimationGenerator,
  withRanges,
} from "@chloranthy/core";
import {
  createEffect,
  createSignal,
  getOwner,
  onCleanup,
  runWithOwner,
} from "solid-js";

function at(start: number = Infinity, t: number) {
  return Math.max(0, t - start);
}

export default function () {
  const [startTime, setStartTime] = createSignal<number>(0);
  const element = (
    <div
      style={{ width: "100px", height: "100px", background: "skyblue" }}
      onClick={() => {
        setStartTime(performance.now());
      }}
    >
      Hello
    </div>
  ) as Element;

  const x: Behavior<number> = withRanges(
    (ranges) => rangeUnion([...ranges, [startTime(), startTime() + 1_000]]),
    (t) => at(startTime(), t) * 2,
  );
  const transform: Behavior<string> = (t) => `translateX(${x(t)}px)`;

  createEffect(async () => {
    const owner = getOwner();
    const animationGenerator = toAnimationGenerator(
      element,
      "transform",
      transform,
    );
    for (const animation of animationGenerator) {
      runWithOwner(owner, () => {
        onCleanup(() => {
          console.log("cleanup");
          animation.cancel();
        });
      });
      try {
        await animation.finished;
      } catch (error) {
        if (!(error instanceof DOMException)) {
          throw error;
        }
      }
    }
  });

  return element;
}
