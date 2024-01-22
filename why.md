# Layout Animation in Solid JS

The purpose of this document is to propose a new method of animating between web layouts. This solution is meant specifically to work within the context of the Solid JS web framework.

This document will not go into the pros and cons of existing solutions for layout animations. Instead, it will attempt to present an "ideal" framework for animating layouts on the web by starting from first principles. With that said, let's start from the very beginning.

## What is an animation?

An animation is a change in a value over time.

For now,the values we will consider are position, scaling, and skew in 2d space. Extrapolating these techniques to 3d space is left up to the reader for now.

It is also possible to animate anything else that reduces to a numeric value like border radius, opacity, and color. On the web, some properties are more efficient to animate than others, so lets stick to the `transform` style property for the purposes of this document.

### Lets try it

Imagine a function `animate` that calls a callback every frame with the progress `t` from 0 to 1.

```ts
function animate(fn: (t: number) => void)
```

`mix` linearly interpolates between two numbers, with progress `t` from 0 to 1.

```ts
function mix(start: number, end: number, t: number): number
```

Now we can animate our element's transform one value at a time.

```ts
animate(t => {
  const x = mix(100, 200, t)
  const y = mix(300, 100)
  element.style.transform = `translate3d(${x}px, ${y}px, 0px)`
})
```

## Types

### Vectors

In computer graphics, it is convenient to group transformations together into one value. This is called a vector.

```ts
type Vec2 = [number, number]
```

We can now mix vectors to simplify our code.

```ts
function vec2Mix(start: Vec2, end: Vec2, t: number): Vec2 {
  return [
    mix(start[0], end[0], t)
    mix(start[1], end[1], t)
  ]
}
```

We will be calling this function a lot (every frame), so lets avoid creating any new objects. Unfortunately there's no way to do this in JS without mutating an existing object.

```ts
function vec2Mix(out: Vec2, start: Vec2, end: Vec2, t: number): Vec2 {
  out[0] = mix(start[0], end[0], t)
  out[1] = mix(start[1], end[1], t)
  return out
}
```

```ts
const start = [100, 200]
const end = [300, 100]

animate(t => {
  const translate = mix(start, end, t)
  element.style.transform = `translate3d(${translate[0]}px, ${translate[1]}px, 0px)`
})
```

If we can use vectors to represent a 2d translation, we can use affine transformation matrices to represent any 2d affine transformation. From now on lets just assume we are using [gl-matrix](), where `Vec2` is a 2d vector, `Mat2` is a 2x2 matrix for 2d linear transformations, and `Mat2d` is a 2x3 matrix for 2d affine transformations.

### Rectangles

The above animates an elements position and size relative to the element's position and size in a layout.

Really, we to animate from one layout to another. Let's define a type to represent a layout

```ts
interface Rect {
  x: number
  y: number
  width: number
  height: number
}
```

You might notice that this is the same as a `DOMRect` but without some other properties we don't care about. Like `DOMRect`, let's assume that `x` and `y` are relative to the top left corner of the screen.

```ts
function rectMix(out: Rect, start: Rect, end: Rect, t: number): number
```

We can animate a rect using the same method as above, but the transform property is relative to the element it is set on. How can we calculate the transform required to position an element so that it visually matches the position of a viewport-relative rect?

Imagine we have a function that returns a transformation matrix such that when it is applied to rect `source` will result in rect `target`.

```ts
function rectUntransformMat2d(out: Mat2d, source: Rect, target: Rect): Mat2d
```

We will get to matrix application—`rectTransformMat2d`—shortly. We don't need it for now because matrix application for elements is handled by the `transform` style property.

So, let's create a utility to convert a matrix to a string that works with the `transform` property.

```ts
function mat2dToString(m: Mat2d): string
```

Then we can match an element to any rect like this:

```ts
const targetRect = { x: 100, y: 100, width: 50, height: 50 }
const sourceRect = element.getBoundingClientRect()
const matrix = rectUntransformMat2d(mat2dCreate(), sourceRect, targetRect)
element.style.transform = mat2dToString(matrix)
```

### Quads

Great, but what about rotation? More specifically, what about the X and Y skew components of transformation matrices? Well, rects can't be skewed because they are axis-aligned. Therefore, we can't apply a matrix to a rect, and this function does not make sense:

```ts
function rectTransformMat2d(out: Rect, rect: Rect, matrix: Mat2d): Rect
```

To fix this, let's define a new type that doesn't have the requirement of being axis-aligned.

```ts
type Quad = {
  k: Vec2 // position
  ij: Mat2 // scale & skew
}
```

So now we can write these functions:

```ts
function rectTransformMat2d(out: Quad, rect: Rect, matrix: Mat2d): Quad
function quadTransformMat2d(out: Quad, rect: Quad, matrix: Mat2d): Quad
function quadUntransformMat2d(out: Mat2d, source: Quad, target: Quad): Quad
```

## Multiple Elements

So far we've been working with a single element. In practice, web applications may have many animating elements. Some will even have a parent-child relationship, such that transforming one element will affect the the viewport quad of another.

This creates a problem with obtaining the viewport quad of an element, as we can no longer reliably use `getBoundingClientRect`: it returns a rect, not a quad. Moreover, when should we call such a measurement function? Measuring an element is an expensive operation, so we want to avoid it as much as possible, and measuring on every frame is not acceptable.

### Layout vs View

To solve this, let's break the problem down a bit. There are really two relevant values here:

1. The _layout_ rect: the rect that represents the element's position in layout before any transforms are set anywhere in the DOM. This value need not be a quad because skew is not possible without transforms. This value is document relative, because it does not change unless the layout changes. This rect is the answer to the question "where was this element _rendered_?".
2. The _view_ quad: the quad of the element as it appears in the view, including transforms. This value must be a quad because any of its ancestors may have a transform set. This value is viewport relative, because it represents the visual position of the element on the screen. This quad is the answer to the question "where was this element _painted_?".

What did we gain from redefining the element's properties in this way? Notice that it is not possible for a change in the element's view quad to trigger a change in any element's layout rect. Furthermore, we only need to measure when obtaining the layout rect; we can calculate the view quad as an accumulation of each of an element's parent's layout rects and transform properties. Thus, we have reduced the need to measure unless the layout changes, and we are free to set the transform on the element every frame _while still maintaining a perfect representation of the element's position in the view_ in the form of the view quad. We can then use the view quads to create seamless animations between elements in a way that is visually consistent, and unaffected by other animations that may be running on the page.

### Setting transforms

Let's keep track of the transforms we set on each element.

```ts
const transforms = new ReactiveMap<Element, Mat2d>()

function setTransform(element: Element, matrix: Mat2d) {
  element.style.transform = mat2dToString(matrix)
  transforms.set(element, matrix)
}
```

### Layout Rect

Let's create a hook for listening to changes in the layout rect.

```ts
function useLayoutRect(element: Element): Accessor<Rect | undefined>
```

The layout rect is similar to a rect constructed from the `offsetTop`, `offsetLeft`, `offsetWidth`, and `offsetHeight` values, in that it is document relative and ignores transforms. The `offset` properties round to the nearest integer, so we can't use them, and we must rely on `getBoundingClientRect` instead:

```ts
function measure() {
  const transforms = new Map<Element, string>()

  for (const parent in getParents(element)) {
    transforms.set(parent, parent.style.transform)
    parent.style.transform = ''
  }

  const rect = element.getBoundingClientRect()

  for (const [parent, transform] in transforms.entries()) {
    parent.style.transform = transform
  }

  return rect
}
```

### View Quad

Calculating the view quad requires some tricky linear algebra that we will not go over here. Suffice it to say that it is a complex memo that accumulates the layout rects, transforms, and scroll positions of each of an element's ancestors. Fortunately, this algorithm is bound by the element's depth, and in practice we can skip matrix multiplication on elements that don't have a transform set on them.

```ts
function useViewQuad(element: Element): Accessor<Quad | undefined>
```

### Utilities

Finally, lets round out our toolbox with some utilities. This hook sets an element's transform whenever a signal of `Mat2d` updates.

```ts
function createSetTransform(element: Element, transform: Accessor<Mat2d>)
```

The following sets the transform on an element to match a quad, using the `quadUntransformMat2d` technique we talked about earlier:

```ts
function createSetQuad(element: Element, transform: Accessor<Quad>)
```

## Transitions

We have everything we need to animate, now let's try transitioning between layouts.

### FLIP

We can start with the _FLIP_ technique.

- _First_: Calculate the element's view quad before its layout rect changes.
- _Last_: Update the layout, then calculate the new view quad.
- _Invert_: Calculate the transformation from the _Last_ quad to the _First_ quad. The element will now appear to be in its old position despite the layout rect having changed.
- _Play_: Interpolate the element back to the _Last_ quad, thus giving the appearance of animating between layouts.

Some reorganization is needed to make this algorithm work within a reactive paradigm.

```ts
const rect = useLayoutRect(element)

createMemo<Quad>(
  (prevRectValue) => {

		// Last
		const rectValue = rect()

		createRoot((dispose) => {
			const matrix = mat2dCreate()
			const startQuad = quadFromRect(quadCreate(), prevRectValue)
			const endQuad = quadFromRect(quadCreate(), rectValue)

			// Play
			animate((t) => {
				quadMix(startQuad, startQuad, endQuad, t)

				// Invert
				quadUntransformMat2d(matrix, endQuad, startQuad)

				element.style.transform = mat2dToString(matrix)
			}).then(dispose)
		})

		return prevRectValue
  }),

	// First
	untrack(rect)
)
```

### Shared Element Matching

Sometimes we want to animate between two different elements but make them appear to be the same. We can use FLIP, but we need some way to figure out which elements should be treated as _matching_

On each state change we can have each element attempt to either enter or exit with a given _transition key_:

```ts
function attemptEnter(
  key: T,
  value: Enter,
  onSuccess: (value: Exit) => void,
  onFailure: () => void,
): void

function attemptExit(
  key: T,
  value: Exit,
  onSuccess: (value: Enter) => void,
  onFailure: () => void,
): void
```

One microtask later, we can check which keys have matching entering and exiting keys, and pass each corresponding value to the callbacks of the opposing attempt. This way, exiting elements know where they should animate to, and entering elements know where they should animate from.

### Zombies

Sometimes we need to keep an element inserted into the DOM even though its component has been unmounted. For example, when an element is playing an exit transition, it needs to be connected to the DOM to remain visible, but we only need to play exit transitions when a component unmounts.

#### In React

Framer Motion calls this feature "Presence". It works by wrapping each child of a `Presence` component in its own context:

```ts
type PresenceChildContext = Context<{
  usePresence: () => [isPresent: boolean, onSafeToRemove: () => void]
}>
```

If `usePresence` is called, the `Presence` component will not un-render the corresponding child until `safeToRemove` is called, even if the component that calls `usePresence` is removed by some other descendant of `Presence`.

#### In Solid

We can't replicate this exactly in Solid. The only way to map over children in Solid is to resolve them with the `children` helper, but once they are resolved, they can no longer be run within a different context.

Fortunately though, we have much more control over the reactivity model. Let's write a new primitive:

```ts
function createRootWithContext<T>(fn: (dispose: () => void) => T) {
  const owner = getOwner()
  return createRoot(dispose => {
    const rootOwner = getOwner()
    if (rootOwner && owner) {
      rootOwner.context = owner.context
    }
    return fn(dispose)
  })
}
```

This gives us a new root, but with a snapshot of the surrounding context. The root will not dispose unless the `dispose` function is called, even if the surrounding context does.

Like before, we have a `Presence` parent component:

```tsx
const PresenceContext = createContext<{
  addUnmountedChild: (jsx: JSX.Element) => () => void
}>()

function Presence() {
  const [unmountedChildren, setUnmountedChildren] = createSignal<JSX.Element[]>([])

  return (
    <PresenceContext.Provider value={/* ... */}>
      {props.children}
      {unmountedChildren()}
    </PresenceContext.Provider>
  )
}
```

In lieu of `usePresence`, we have `Zombie`

```tsx
const ZombieContext = createContext<{
  isPresent: Accessor<boolean>
  usePresence: () => () => void
}>

function Zombie() {
  const parent = useContext(PresenceContext)
  const [isUnmounted, setIsUnmounted] = createSignal(false)

  let removeUnmountedChild: (() => void) | undefined

  const [jsx, dispose] = createRootWithContext(disposeRoot => {
    const dispose = () => {
      disposeRoot()
      removeUnmountedChild?.()
    }

    return [
      <ZombieContext.Provider value={/* ... */}>{props.children}</ZombieContext.Provider>,
      dispose,
    ]
  })

  onCleanup(() => {
    setIsUnmounted(true)
    removeUnmountedChild = parent?.addUnmountedChild(jsx)
  })

  return jsx
}
```

Now exiting children of `Zombie` can prevent unmounting at the zombie boundary by calling

```ts
const onSafeToRemove = useZombieContext()?.usePresence()
```

The zombie will "re-mount" itself as a child of its nearest `Presence` ancestor, while keeping the same context value it had when it first rendered.

### Chaining & Interruption

// TODO - Just dumping some source code in for now

```ts
function makeViewTransition(element: HTMLElement, options: ViewTransitionOptions) {
  const owner = getOwner()
  const { key, onEnterMatch, onExitMatch, onEnter, onExit } = options
  const { matcher } = useViewTransitionContext()
  const [animation, setAnimation] = createSignal<ReactiveAnimation | undefined>()
  const layoutModel = useLayoutModel()
  const rect = layoutModel.useRect(element)

  const createOnAnimationFinished = (fn: () => void) => {
    createEffect(() => {
      if (animation()?.isFinished() ?? true) {
        fn()
      }
    })
  }

  const onEnterAttempt = (exitingMatch?: ViewTransitionMatch) => {
    createSubRoot(dispose => {
      setAnimation(
        (exitingMatch ? onEnterMatch?.(element, exitingMatch) : onEnter?.(element)) ?? undefined,
      )
      createOnAnimationFinished(dispose)
    }, owner)
  }

  matcher.attemptEnter(key, animation, onEnterAttempt, onEnterAttempt)

  const unmounted = useUnmounted()
  const release = useDisposal()

  createEffect(
    on(
      unmounted,
      () => {
        const rectValue = untrack(rect)
        if (rectValue) {
          const onSuccess = (matchAnimation: Accessor<ReactiveAnimation | undefined>) => {
            createSubRoot(() => {
              createEffect(
                on(matchAnimation, matchAnimationValue => {
                  layoutModel.invalidateRect(element)

                  setAnimation(
                    onExitMatch?.(element, {
                      animation: matchAnimationValue,
                      rect: rectValue,
                    }) ?? undefined,
                  )
                  createOnAnimationFinished(release)
                }),
              )
            }, owner)
          }

          const onFailure = () => {
            createSubRoot(() => {
              setAnimation(onExit?.(element) ?? undefined)
              createOnAnimationFinished(release)
            }, owner)
          }

          matcher.attemptExit(
            key,
            { animation: untrack(animation), rect: rectValue },
            onSuccess,
            onFailure,
          )
        }
      },
      { defer: true },
    ),
  )
}
```

### Tying it together

Now, we should be able to wrap everything together in one simple primitive.

```ts
function createLayoutAnimation(element: Element, options: { duration: number, easing: /* ... */ })
```

## Timelines

// TODO

### Precalculating Keyframes

// TODO
