import { onSettled, useContext, createEffect, onCleanup } from "solid-js";
import { useDispose, useUnmounted, Zombie } from "../../../src";
import { PageTransitionContext } from "../../lib/page-transitions";

export default function PageTransitionsAlphaRoute() {
  console.log("alpha route");
  return (
    <Zombie>
      {(() => {
        const dispose = useDispose();
        const unmounted = useUnmounted();
        const { matcher } = useContext(PageTransitionContext);

        console.log("alpha create");

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
            console.log("alpha unmounted", unmounted);
            if (unmounted) {
              dispose();
            }
          },
        );

        onCleanup(() => {
          console.log("alpha onCleanup");
        });

        return <div style={{ background: "lightpink" }} />;
      })()}
    </Zombie>
  );
}
