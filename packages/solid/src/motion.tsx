import {
	ComponentProps,
	createContext,
	createUniqueId,
	onCleanup,
	useContext,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { PresenceContext } from "./presence";

interface MotionContextValue {
	usePresence: () => () => void;
	isPresent: () => boolean;
}

const MotionContext = createContext<MotionContextValue | undefined>();

export function Motion(props: ComponentProps<typeof Dynamic>) {
	let root!: Element;
	const parentContext = useContext(MotionContext);
	const presenceContext = useContext(PresenceContext);
	const exitComplete = new Map<string, boolean>();
	const presenceChild = presenceContext?.createPresenceChild(root);

	const context = {
		isPresent: () =>
			presenceContext
				? presenceContext.isPresent(root)
				: parentContext?.isPresent() ?? false,
		usePresence: presenceChild
			? () => {
					const id = createUniqueId();

					exitComplete.set(id, false);
					onCleanup(() => {
						exitComplete.delete(id);
					});

					return () => {
						exitComplete.set(id, true);
						if (
							Array.from(exitComplete.values()).every(
								(isComplete) => isComplete,
							)
						) {
							presenceChild();
						}
					};
				}
			: parentContext?.usePresence ?? (() => () => {}),
	};

	return (
		<PresenceContext.Provider value={undefined}>
			<MotionContext.Provider value={context}>
				<Dynamic
					{...props}
					ref={(element: Element) => {
						root = element;
						props["ref"]?.(element);
					}}
				/>
			</MotionContext.Provider>
		</PresenceContext.Provider>
	);
}
