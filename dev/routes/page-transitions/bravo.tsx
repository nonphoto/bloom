import { useContext, createMemo } from "solid-js";
import { PageTransitionContext, getName } from "../../lib/page-transitions";

export default function PageTransitionsBravoRoute() {
  const name = createMemo(() => getName("bravo"));

  const { setElement } = useContext(PageTransitionContext);

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
