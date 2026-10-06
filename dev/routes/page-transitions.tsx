import { ParentProps } from "solid-js";
import { ZombieBoundary, Zombies } from "../../src/zombie";
import { PageTransition } from "../lib/page-transitions";

export default function PageTransitionsRoute(props: ParentProps) {
  return (
    <PageTransition>
      <ZombieBoundary>
        <header
          style={{
            position: "absolute",
            inset: "0 auto auto 0",
            display: "flex",
            "flex-direction": "column",
          }}
        >
          <a href="/page-transitions/alpha">Alpha</a>
          <a href="/page-transitions/bravo">Bravo</a>
        </header>
        <div
          style={{
            height: "100svh",
            display: "grid",
            "grid-template-columns": "2fr 1fr",
            "grid-template-rows": "2fr 1fr",
            gap: "1rem",
          }}
        >
          {props.children}
          <Zombies />
        </div>
      </ZombieBoundary>
    </PageTransition>
  );
}
