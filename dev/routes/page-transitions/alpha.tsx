import { createMemo, onSettled, useContext } from "solid-js";
import { PageTransitionContext, getName } from "../../lib/page-transitions";

export default function PageTransitionsAlphaRoute() {
  performance.mark("alpha create");

  const name = createMemo(() => getName("alpha"));

  const { setElement } = useContext(PageTransitionContext);

  onSettled(() => {
    performance.mark("alpha onSettled");
    return () => {
      performance.mark("alpha onCleanup");
    };
  });

  return (
    <div
      ref={(element) => {
        performance.mark("alpha setElement");
        setElement(element);
      }}
      style={{ background: "lightpink", "text-align": "center" }}
    >
      {name()}
    </div>
  );
}
