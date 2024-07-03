import type { ComponentProps } from "solid-js";
import { createEffect, createSignal } from "solid-js";

enum IslandState {
  Idle = "idle",
  RingMode = "ring-mode", 
  Timer = "timer", 
  Listening = "listening"
}

export const [islandState, setIslandState] = createSignal<IslandState>(IslandState.Idle);
export function DynamicIslandButtons() {
  function onClick(e: MouseEvent) {
    const el = e.target as HTMLButtonElement;
    setIslandState(el.getAttribute("data-state") as IslandState);
  }

  createEffect(() => {
    console.log({
      islandState: islandState() 
    })
  })

  return (
		<div class="flex justify-center gap-2 rounded-b-xl p-2 py-2.5">
			<Button data-state={IslandState.Idle} onClick={onClick}>Idle</Button>
			<Button data-state={IslandState.RingMode} onClick={onClick}>Ring Mode</Button>
			<Button data-state={IslandState.Timer} onClick={onClick}>Timer</Button>
			<Button data-state={IslandState.Listening} onClick={onClick}>Listening</Button>
		</div>
	);
}

function Button(props: ComponentProps<'button'>) {
  return (
		<button class="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-1200 shadow-border outline-none transition-colors hover:bg-gray-200 focus-visible:shadow-focus-ring-Button" {...props}>
			{props.children}
		</button>
	);
}
