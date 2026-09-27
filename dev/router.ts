import { createRouter } from "@solidjs/router";
import { lazy } from "solid-js";

export const Router = createRouter({
  routes: [
    {
      path: "/",
      component: lazy(() => import("./routes/index")),
    },
    {
      path: "animation-chain",
      component: lazy(() => import("./routes/animation-chain")),
    },
    {
      path: "batcher",
      component: lazy(() => import("./routes/batcher")),
    },
    {
      path: "grid-layout",
      component: lazy(() => import("./routes/grid-layout")),
    },
    {
      path: "matcher",
      component: lazy(() => import("./routes/matcher")),
    },
    {
      path: "list-layout",
      component: lazy(() => import("./routes/list-layout")),
    },
    {
      path: "rect-observer",
      component: lazy(() => import("./routes/rect-observer")),
    },
    {
      path: "spring",
      component: lazy(() => import("./routes/spring")),
    },
    {
      path: "transducer-animation",
      component: lazy(() => import("./routes/transducer-animation")),
    },
  ],
});
