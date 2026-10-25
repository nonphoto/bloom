import { createMemo, useContext } from "solid-js";
import { PageTransitionContext, getName } from "../../lib/page-transitions";

export default function PageTransitionsAlphaRoute() {
  const name = createMemo(() => getName("alpha"));

  const { setElement } = useContext(PageTransitionContext);

  return (
    <div
      ref={setElement}
      style={{ background: "lightpink", "text-align": "center" }}
    >
      {name()}
    </div>
  );
}
