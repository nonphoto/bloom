import { createMemo, For } from "solid-js";
import { fetchAllPages } from "../../lib/page-transitions";

export default function PageTransitionsIndexRoute() {
  const allPages = createMemo(() => fetchAllPages());
  return (
    <ul>
      <For each={allPages()}>
        {(page) => (
          <li>
            <a href={`/page-transitions/${page.name}`}>{page.name}</a>
          </li>
        )}
      </For>
    </ul>
  );
}
