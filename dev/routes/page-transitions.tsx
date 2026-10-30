import { ParentProps } from "solid-js";
import { PageTransition } from "../lib/page-transitions";

export default function PageTransitionsRoute(props: ParentProps) {
  return <PageTransition>{props.children}</PageTransition>;
}
