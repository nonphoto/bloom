import { Rect } from "@thi.ng/geom";
import { Accessor, createContext, createEffect, ParentProps } from "solid-js";
import { Matcher } from "../../src/matcher";
import { useIsRouting } from "@solidjs/router";
import { dampingFromHalflife, stiffnessFromDamping } from "@nonphoto/spring";

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
    (isRouting) => (!isRouting ? matcher.flush() : undefined),
  );

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
