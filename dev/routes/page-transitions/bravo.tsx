import { createEffect, createSignal, latest, useContext } from "solid-js";
import {
  useDispose,
  useRectObserver,
  useUnmounted,
  Zombie,
} from "../../../src";
import { PageTransitionContext } from "../../lib/page-transitions";
import { Rect } from "@thi.ng/geom";
import { useBeforeLeave } from "@solidjs/router";

export default function PageTransitionsBravoRoute() {
  return (
    <Zombie>
      {(() => {
        const [element, setElement] = createSignal<HTMLElement>();
        const unmounted = useUnmounted();
        const dispose = useDispose();
        const { matcher } = useContext(PageTransitionContext);
        const rectObserver = useRectObserver();

        useBeforeLeave((event) => {
          event.preventDefault();
          rectObserver.getRect(element()!).then((rect) => {
            console.log("observer rect", rect);
            event.retry(true);
          });
        });

        createEffect(
          () => latest(unmounted),
          (unmounted) => {
            if (unmounted) {
              matcher.attemptExit({ rect: new Rect() }, (match) => {
                if (match) {
                  console.log("exit match");
                }
                dispose();
              });
            }
          },
        );

        return <div ref={setElement} style={{ background: "lightblue" }} />;
      })()}
    </Zombie>
  );
}
