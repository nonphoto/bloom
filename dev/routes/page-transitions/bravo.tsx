import {
  createSignal,
  useContext,
  onCleanup,
  createEffect,
  createMemo,
} from "solid-js";
import { createRect, getRect } from "../../../src";
import { PageTransitionContext, getName } from "../../lib/page-transitions";
import { Rect } from "@thi.ng/geom";

export default function PageTransitionsBravoRoute() {
  const name = createMemo(() => getName("bravo"));

  console.log("bravo create");

  const [element, setElement] = createSignal<HTMLElement>();
  const { matcher, batcher } = useContext(PageTransitionContext);
  const rect = createRect(element);

  let prevRect: Rect | undefined;
  createEffect(
    () => rect(),
    (rectValue) => {
      prevRect = rectValue;
    },
  );

  onCleanup(() => {
    batcher.enqueue(() => {
      console.log("bravo attempt");
      matcher.attemptExit({ rect }, (match) => {
        if (match) {
          console.log("exit match", match);
        }
      });
    });
    const rect = getRect(element()!);
  });

  return (
    <div
      ref={setElement}
      style={{
        background: "lightblue",
        "text-align": "center",
        "grid-row": 2,
        "grid-column": 2,
      }}
    >
      {name()}
    </div>
  );
}
