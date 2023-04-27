TODO: Difference between

- document rect (before scrolling, relative to document)
- client rect (after scrolling, relative to window)
- transform (after scrolling, relative to window, affected by rotation, scale, etc)
  Below uses document rect but after scrolling?
  Maybe transforming an element creates a new context?
- this doesnt work with transform-based layouts
  How about:
- one observer per element, includes scroll observer
- offset rect (before transform, relative to document)
- client rect (after transform, relative to window)
- manually add children to parent observers
- This avoids having to walk the tree or add mutation observers but makes construction more difficult
  What about position absolute?
- position property affects the element that offset values are relative to
- use offsetParent property
- Scrolling elements should always be positioned, require all scrolling and positioned elements to be observed
  How to determine if an element is positioned? it might change with css?
- this should be solved the same way as layout, remeasure the element on resize

All scrolling elements must be positioned
non-relative-positioned elements are not allowed as children of static-positioned elements

```ts
// Imaginary reactive math API (this would need to account for undefined somehow)
const outerTransform = rect.divide(animatedOuterRect, outerRect)
const layoutTranslation = vec2.sub(
  () => innerRect().position,
  () => outerRect().position,
)
const outerTransformInverse = mat2d.translate(
  mat2d.invert(mat2d.translate(outerTransform, layoutTranslation)),
  layoutTranslation,
)
const animatedInnerRect = rect.cover(animatedOuterRect, innerRect)
const innerTransform = mat2d.multiply(
  outerTransformInverse,
  rect.divide(animatedInnerRect, innerRect),
)
const combinedTransform = mat2d.multiply(outerTransform, innerTransform)

// Object pooling

const { outerTransform, innerTransform, combinedTransform } = createAnimationFrame(() => {
  const outerTransform = rect.divide(animatedOuterRect(), outerRect())
  const layoutTranslation = vec2.sub(
    () => innerRect().position,
    () => outerRect().position,
  )
  const outerTransformInverse = mat2d.translate(
    mat2d.invert(mat2d.translate(outerTransform, layoutTranslation)),
    layoutTranslation,
  )
  const animatedInnerRect = rect.cover(animatedOuterRect(), innerRect())
  const innerTransform = mat2d.multiply(
    outerTransformInverse,
    rect.divide(animatedInnerRect, innerRect),
  )
  const combinedTransform = mat2d.multiply(outerTransform, innerTransform)
  return { outerTransform, innerTransform, combinedTransform }
})

// What about transducers?
```
