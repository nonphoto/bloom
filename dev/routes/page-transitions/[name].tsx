import { createMemo, useContext } from "solid-js";
import { PageTransitionContext, fetchPage } from "../../lib/page-transitions";
import { RouteDefinition, RouteProps } from "@solidjs/router";

export const route = {
  preload: ({ params }) => void fetchPage(params.name as string),
} satisfies RouteDefinition;

export default function PageTransitionsNameRoute(
  props: RouteProps<typeof route>,
) {
  const page = createMemo(() => fetchPage(props.params.name as string));
  const { setElement } = useContext(PageTransitionContext);
  // TODO: setting element to undefined causes infinite loop

  return (
    <div
      ref={setElement}
      style={{
        background: page().value.backgroundColor,
        "text-align": "center",
      }}
    >
      {page().value.name}
    </div>
  );
}
