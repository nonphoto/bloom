import { createEffect, createSignal, onSettled } from "solid-js";

export default function SuspendAnimationRoute() {
  const [suspended, setSuspended] = createSignal(false);
  let element!: HTMLDivElement;

  onSettled(() => {
    element.animate(
      { transform: [`translateX(0px)`, `translateX(400px)`] },
      { duration: 4000, iterations: Infinity },
    );
  });

  const suspendedAnimations = new Set<Animation>();

  createEffect(
    () => suspended(),
    (suspended, prev) => {
      console.log(suspended, prev);
      if (prev == null) return;
      if (suspended) {
        for (const animation of element.getAnimations()) {
          const suspendedAnimation = new Animation(animation.effect);
          suspendedAnimation.currentTime = animation.currentTime;
          suspendedAnimations.add(suspendedAnimation);
          animation.cancel();
        }
      } else {
        for (const animation of suspendedAnimations.values()) {
          animation.play();
        }
      }
    },
  );

  return (
    <div
      onClick={() => {
        setSuspended((suspended) => !suspended);
      }}
    >
      <div
        ref={element}
        style={{ width: "100px", height: "100px", background: "skyblue" }}
      />
    </div>
  );
}
