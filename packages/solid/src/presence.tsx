import { resolveFirst } from "@solid-primitives/refs";
import { createSwitchTransition } from "@solid-primitives/transition-group";
import {
	FlowProps,
	JSX,
	createContext,
	createEffect,
	onCleanup,
} from "solid-js";
import {
	createStaticStore,
	StaticStoreSetter,
} from "@solid-primitives/static-store";

interface PresenceContextValue {
	createPresenceChild: (child: Element) => () => void;
	isPresent: (child: Element) => boolean;
}

interface PresenceChild {
	isPresent: boolean;
	isExitComplete: boolean;
}

export const PresenceContext = createContext<
	PresenceContextValue | undefined
>();

export function Presence(props: FlowProps) {
	const presenceChildren = new Map<
		Element,
		[PresenceChild, StaticStoreSetter<PresenceChild>]
	>();

	const context = {
		createPresenceChild: (element: Element) => {
			const [child, setChild] = createStaticStore({
				isPresent: true,
				isExitComplete: false,
			});

			presenceChildren.set(element, [child, setChild]);

			onCleanup(() => {
				presenceChildren.delete(element);
			});

			return () => setChild("isExitComplete", true);
		},
		isPresent: (child: Element) => {
			return presenceChildren.get(child)?.[0].isPresent ?? false;
		},
	};

	return (
		<PresenceContext.Provider value={context}>
			{
				createSwitchTransition(
					resolveFirst(() => props.children),
					{
						onExit(element, done) {
							const presenceChild = presenceChildren.get(element);

							if (presenceChild) {
								const [child, setChild] = presenceChild;

								createEffect(() => {
									if (child.isExitComplete) {
										done();
									}
								});

								setChild("isPresent", false);
							} else {
								done();
							}
						},
					},
				) as unknown as JSX.Element
			}
		</PresenceContext.Provider>
	);
}
