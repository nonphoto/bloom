import { Mat } from "@thi.ng/matrices";
import { ZERO2 } from "@thi.ng/vectors";
import {
  ComponentProps,
  createContext,
  createSignal,
  splitProps,
  useContext,
} from "solid-js";
import { layoutCreate, Layout as LayoutType } from "../layout";
import { createRect } from "../rectObserver";

interface LayoutContext extends LayoutType {}

const LayoutContext = createContext<LayoutContext>();

interface LayoutProps extends ComponentProps<"div"> {
  matrix?: Mat;
}

export function Layout(props: LayoutProps) {
  const [, childProps] = splitProps(props, ["matrix"]);
  const [ref, setRef] = createSignal<HTMLDivElement>();
  const parentLayout = useContext(LayoutContext);
  const rect = createRect(ref);

  return (
    <LayoutContext.Provider
      value={layoutCreate({
        parent: parentLayout,
        rect,
        scroll: () => ZERO2,
        matrix: () => props.matrix,
      })}
    >
      <div ref={setRef} {...childProps} />
    </LayoutContext.Provider>
  );
}
