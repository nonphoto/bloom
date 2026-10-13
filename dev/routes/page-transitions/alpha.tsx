import { createMemo, onCleanup, onSettled, useContext } from "solid-js";
import { PageTransitionContext, getName } from "../../lib/page-transitions";

export default function PageTransitionsAlphaRoute() {
  const name = createMemo(() => getName("alpha"));

  console.log("alpha create");

  const { matcher } = useContext(PageTransitionContext);

  onSettled(() => {
    matcher.attemptEnter({}, (match) => {
      if (match) {
        console.log("enter match", match?.rect);
      }
    });
  });

  onCleanup(() => {
    console.log("alpha onCleanup");
  });

  return (
    <div style={{ background: "lightpink", "text-align": "center" }}>
      {name()}
    </div>
  );
}
