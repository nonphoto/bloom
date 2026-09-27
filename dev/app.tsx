import { Loading } from "solid-js";
import "./app.css";
import { Router } from "./router";

export default function App() {
  return (
    <Router>
      {(props) => (
        <Loading fallback={<main>Loading…</main>}>
          <main>{props.children}</main>
        </Loading>
      )}
    </Router>
  );
}
