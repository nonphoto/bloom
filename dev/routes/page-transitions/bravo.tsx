import { useContext, createMemo, onSettled } from "solid-js";
import { PageTransitionContext, getName } from "../../lib/page-transitions";

export default function PageTransitionsBravoRoute() {
  performance.mark("bravo create");
  const name = createMemo(() => getName("bravo"));

  const { setElement } = useContext(PageTransitionContext);

  onSettled(() => {
    performance.mark("bravo onSettled");
    return () => {
      performance.mark("bravo onCleanup");
    };
  });

  return (
    <div
      ref={(element) => {
        performance.mark("bravo setElement");
        setElement(element);
      }}
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
