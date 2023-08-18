# Getting started

## Install

`npm i unocss-auto-svg`

## Setup

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import Unocss from 'unocss/vite'
import UnocssAutoSvg from 'unocss-auto-svg'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    Unocss({
      content: {
        filesystem: ['src/helper/unocss-auto-svg.ts'],
      },
    }),
    UnocssAutoSvg(),
  ],
})
```

## Config Options

```ts
type Options = Partial<{
  prefix: string // 前缀
  iconsDir: string
  excludes: string[]
  outputFile: string
}>

const defaultOptions = {
  prefix: 'i-icon',
  iconsDir: 'src/icons',
  excludes: [],
  outputFile: 'src/helper/unocss-auto-svg.ts',
}
```
