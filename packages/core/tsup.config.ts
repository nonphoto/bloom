// import { defineConfig } from 'tsup-preset-solid'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/body.ts',
    'src/body1d.ts',
    'src/body2d.ts',
    'src/quad2d.ts',
    'src/rect.ts',
    'src/spring.ts',
  ],
  dts: true,
})
