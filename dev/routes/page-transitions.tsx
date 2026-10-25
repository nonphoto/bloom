import { ParentProps } from "solid-js";
import { PageTransition } from "../lib/page-transitions";

export default function PageTransitionsRoute(props: ParentProps) {
  return (
    <PageTransition>
      <header
        style={{
          position: "absolute",
          inset: "0 auto auto 0",
          display: "flex",
          "flex-direction": "column",
          "z-index": 1,
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
      </div>
    </PageTransition>
  );
}
