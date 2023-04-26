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
