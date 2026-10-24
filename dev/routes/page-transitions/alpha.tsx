import { createMemo, onCleanup, onSettled, useContext } from "solid-js";
import { PageTransitionContext, getName } from "../../lib/page-transitions";
import { createLog } from "../../lib/log";

export default function PageTransitionsAlphaRoute() {
  const name = createMemo(() => getName("alpha"));

  console.log("alpha create");

  const { matcher, batcher, element, setElement, rect } = useContext(
    PageTransitionContext,
  );

  onSettled(() => {
    console.log("alpha onSettled");
    batcher.enqueue(() => {
      console.log("alpha attempt");
      matcher.attemptEnter({}, (match) => {
        if (match) {
          console.log("enter match", match?.rect);
        }
      });
    });
  });

  createLog("alpha element", element);
  createLog("alpha rect", rect);

  onCleanup(() => {
    console.log("alpha onCleanup");
  });

  return (
    <div
      ref={setElement}
      style={{ background: "lightpink", "text-align": "center" }}
    >
      {name()}
    </div>
  );
}
