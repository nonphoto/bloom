import { Rect } from "@thi.ng/geom";
import { createContext, createEffect, ParentProps } from "solid-js";
import { Matcher } from "../../src/matcher";
import { useIsRouting } from "@solidjs/router";
import { dampingFromHalflife, stiffnessFromDamping } from "@nonphoto/spring";
import { useBeforeLeave } from "@solidjs/router";

type PageTransitionMatch = { rect?: Rect };

interface PageTransitionContextValue {
  matcher: Matcher<PageTransitionMatch>;
}

export const PageTransitionContext =
  createContext<PageTransitionContextValue>();

export function PageTransition(props: ParentProps) {
  const matcher = new Matcher<PageTransitionMatch>();
  const isRouting = useIsRouting();

  createEffect(
    () => isRouting(),
    (isRouting) => {
      console.log("routing", isRouting);
      if (!isRouting) {
        queueMicrotask(() => {
          matcher.flush();
        });
      }
    },
  );

  useBeforeLeave((event) => {
    console.log("before leave");
  });

  return (
    <PageTransitionContext value={{ matcher }}>
      {props.children}
    </PageTransitionContext>
  );
}

const damping = dampingFromHalflife(200);
const stiffness = stiffnessFromDamping(1, damping);

export const springOptions = {
  damping,
  stiffness,
};
