import { permutations } from "@thi.ng/transducers";
import { createSignal } from "solid-js";
import { createLog, createRect } from "../../src";

const areas = [...permutations([1, 2, 3], [1, 2, 3])];

export default function Layout() {
  const [index, setIndex] = createSignal(0);
  const [element, setElement] = createSignal<HTMLElement>();

  const rect = createRect(element);

  createLog(rect);

  return (
    <div
      style={{
        height: "100svh",
        display: "grid",
        "grid-template-columns": "3fr 2fr 1fr",
        "grid-template-rows": "3fr 2fr 1fr",
      }}
      onClick={() => {
        setIndex((index) => (index + 1) % areas.length);
      }}
    >
      <div
        ref={setElement}
        style={{
          background: "pink",
          "grid-row-start": areas[index()]?.[0],
          "grid-column-start": areas[index()]?.[1],
        }}
      />
    </div>
  );
}
