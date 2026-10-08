import { createEffect, createSignal, useContext, onCleanup } from "solid-js";
import { useDispose, useUnmounted, createRect, Zombie } from "../../../src";
import { PageTransitionContext } from "../../lib/page-transitions";

export default function PageTransitionsBravoRoute() {
  return (
    <Zombie>
      {(() => {
        const [element, setElement] = createSignal<HTMLElement>();
        const unmounted = useUnmounted();
        const dispose = useDispose();
        const { matcher } = useContext(PageTransitionContext);
        const rect = createRect(element);

        console.log("bravo create");

        createEffect(
          () => unmounted(),
          (unmounted) => {
            console.log("bravo unmounted", unmounted);
            if (unmounted) {
              matcher.attemptExit({ rect }, (match) => {
                if (match) {
                  console.log("exit match", match);
                }
                dispose();
              });
            }
          },
        );

        onCleanup(() => {
          console.log("bravo onCleanup");
        });

        return <div ref={setElement} style={{ background: "lightblue" }} />;
      })()}
    </Zombie>
  );
}
