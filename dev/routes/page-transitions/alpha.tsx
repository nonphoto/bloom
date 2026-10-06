import { createRoot, onSettled, useContext, createEffect } from "solid-js";
import { useDispose, useUnmounted, Zombie } from "../../../src";
import { PageTransitionContext } from "../../lib/page-transitions";

export default function PageTransitionsAlphaRoute() {
  return (
    <Zombie>
      {(() => {
        const dispose = useDispose();
        const unmounted = useUnmounted();
        const { matcher } = useContext(PageTransitionContext);

        onSettled(() => {
          matcher.attemptEnter({}, (match) => {
            if (match) {
              console.log("enter match", match?.rect);
            }
          });
        });

        createEffect(
          () => unmounted(),
          (unmounted) => {
            if (unmounted) {
              dispose();
            }
          },
        );

        return <div style={{ background: "lightpink" }} />;
      })()}
    </Zombie>
  );
}
