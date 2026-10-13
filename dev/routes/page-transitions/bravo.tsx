import {
  createSignal,
  useContext,
  onCleanup,
  createEffect,
  createMemo,
} from "solid-js";
import { createRect } from "../../../src";
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
    console.log("bravo onCleanup");
    batcher.enqueue(() => {
      console.log("bravo attempt");
      matcher.attemptExit({ rect: prevRect }, (match) => {
        if (match) {
          console.log("exit match", match);
        }
      });
    });
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
