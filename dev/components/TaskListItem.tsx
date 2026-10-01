import { createUniqueId, merge } from "solid-js";
import { ComponentProps } from "@solidjs/web";
import { combineStyle } from "@solid-primitives/props";

export interface TaskListItemProps extends ComponentProps<"div"> {
  label?: string;
}

export function TaskListItem(props: TaskListItemProps) {
  const id = createUniqueId();
  return (
    <div
      {...props}
      style={combineStyle(
        {
          display: "flex",
          background: "#eee",
          padding: "0.25em 0.5em",
          border: "solid 1px gray",
          "justify-content": "space-between",
          gap: "0.5em",
        },
        props.style || {},
      )}
      aria-labelled-by={id}
    >
      <div id={id}>{props.label}</div>
      {props.children}
    </div>
  );
}
