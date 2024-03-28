import {
	BodyQuad2d,
	bodyQuad2dCreate,
	bodyQuad2dFromRect,
	quad2dCreate,
	quad2dFromRect,
} from "@chloranthy/core";
import {
	ReactiveAnimation,
	ViewTransitionMatch,
	ViewTransitionOptions,
	borderRadius,
	createSetQuad,
	createSpringQuad2d,
	useRect,
	viewTransition,
} from "@chloranthy/solid";
import clsx from "clsx";
import { For, createSignal, untrack } from "solid-js";
import classes from "./List.module.css";

borderRadius;
viewTransition;

const items = [
	"Alpha",
	"Bravo",
	"Charlie",
	"Delta",
	"Echo",
	"Foxtrot",
	"Golf",
	"Hotel",
];

declare module "solid-js" {
	namespace JSX {
		interface Directives {
			viewTransition: ViewTransitionOptions;
			borderRadius: number;
		}
	}
}

function* cycle<T>(n: number, array: T[]) {
	for (let i = 0; i < n; i++) {
		yield array[i % array.length]!;
	}
}

function onEnterMatch(
	element: HTMLElement,
	match: ViewTransitionMatch,
): ReactiveAnimation | undefined {
	const rect = useRect(element);
	const [body, setBody] = createSignal<BodyQuad2d>(
		match.animation
			? untrack(match.animation.body)
			: bodyQuad2dFromRect(bodyQuad2dCreate(), match.rect),
		{
			equals: false,
		},
	);
	const quad = createMemo(quad2dFromRect, quad2dCreate(), rect);
	const isRunning = createSpringQuad2d(quad, body, setBody, 300);
	const isFinished = () => quad() != null && !isRunning();
	createSetQuad(element, () => body().p);
	return {
		isFinished,
		body,
	};
}

function onExitMatch(
	element: HTMLElement,
	match: ViewTransitionMatch,
): ReactiveAnimation | undefined {
	if (match.animation) {
		const body = match.animation.body;
		createSetQuad(element, () => body().p);
		return match.animation;
	}
}

export default function () {
	const [count, setCount] = createSignal(10);
	const [activeItems, setActiveItems] = createSignal(["Delta", "Echo"]);
	const cycledItems = () => [...cycle(count(), items)];

	function addItem(item: string) {
		setActiveItems((items) => [...items, item]);
	}

	function removeItem(item: string) {
		setActiveItems((items) =>
			items.filter((activeItem) => activeItem !== item),
		);
	}

	return (
		<div class={classes.root}>
			<div class={classes.buttons}>
				<button
					onClick={() => {
						setCount((count) => Math.max(0, count - 1));
					}}
				>
					Less
				</button>
				<button
					onClick={() => {
						setCount((count) => count + 1);
					}}
				>
					More
				</button>
			</div>
			<ul class={classes.list}>
				<For
					each={cycledItems().filter((item) => !activeItems().includes(item))}
				>
					{(item) => (
						<li
							use:viewTransition={{
								key: item,
								onEnterMatch,
								onExitMatch,
							}}
						>
							<button
								use:viewTransition={{
									key: `${item}-button`,
									onEnterMatch,
									onExitMatch,
								}}
								onClick={[addItem, item]}
							>
								{item}
							</button>
						</li>
					)}
				</For>
			</ul>
			<ul class={clsx(classes.list, classes.active)}>
				<For each={activeItems()}>
					{(item) => (
						<li
							use:borderRadius={20}
							use:viewTransition={{ key: item, onEnterMatch, onExitMatch }}
						>
							<button
								use:viewTransition={{
									key: `${item}-button`,
									onEnterMatch,
									onExitMatch,
								}}
								onClick={[removeItem, item]}
							>
								{item}
							</button>
						</li>
					)}
				</For>
			</ul>
		</div>
	);
}
