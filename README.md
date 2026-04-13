# unocss-auto-svg

Unocss Auto Svg on-demand for Vite. With TypeScript support. Powered by [Unocss](https://github.com/unocss/unocss).

用于处理Unocss中使用动态svg无法显示的问题，该插件可以自动搜集指定目录的svg文件，并生成拥有// @unocss-include注释的ts文件，从而实现无需手动配置safelist而显示动态icon

## without

对于动态icon，无需在uno.config.ts中手动配置safelist

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
  iconsDir: string | string[] // 图标目录，支持数组或 glob 模式
  excludes: string[]
  outputFile: string
  isDev: boolean
}>

const defaultOptions = {
  prefix: 'i-icon',
  iconsDir: 'src/icons',
  excludes: [],
  outputFile: 'src/helper/unocss-auto-svg.ts',
  isDev: false,
}
```

## Usage Examples

**单目录：**

```ts
UnocssAutoSvg({
  iconsDir: 'src/icons',
})
```

**多目录（支持 glob 模式）：**

```ts
UnocssAutoSvg({
  iconsDir: ['src/icons', 'src/components/*/icons'],
})
```
