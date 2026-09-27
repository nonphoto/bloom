import { ComponentProps } from "@solidjs/web";
import { merge } from "solid-js";
import { combineStyle } from "@solid-primitives/props";

export interface TaskListProps extends ComponentProps<"div"> {}

export function TaskList(props: TaskListProps) {
  const divProps = merge(props, {
    style: combineStyle(props.style || {}, {
      display: "flex",
      "flex-direction": "column",
      gap: "0.5em",
      width: "10em",
    }),
  });
  return <div {...divProps} />;
}
