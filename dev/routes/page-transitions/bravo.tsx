import { useContext, onCleanup, createMemo, createEffect } from "solid-js";
import { getRect } from "../../../src";
import { PageTransitionContext, getName } from "../../lib/page-transitions";
import { duration } from "../../../src/transducer";
import { createLog } from "../../lib/log";

export default function PageTransitionsBravoRoute() {
  const name = createMemo(() => getName("bravo"));

  console.log("bravo create");

  console.log(duration(100));

  const { matcher, batcher, element, setElement, rect } = useContext(
    PageTransitionContext,
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

  createLog("bravo element", element);
  createLog("bravo rect", rect);

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
