import { RectObserver } from "./lib";
import "./style.css";

const rectObserver = new RectObserver();

const scrollParents = Array.from(document.querySelectorAll(".scrollParents"));

for (const element of scrollParents) {
  rectObserver.observeScrollingElement(element);
}
