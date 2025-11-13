import { promises as fs } from 'fs'
import { resolve, dirname } from 'path'
import chokidar from 'chokidar'

type Options = Partial<{
  prefix: string
  iconsDir: string
  excludes: string[]
  outputFile: string
  isDev: boolean
}>

const defaultOptions: Options = {
  prefix: 'i-icon',
  iconsDir: 'src/icons',
  excludes: [],
  outputFile: 'src/helper/unocss-auto-svg.ts',
  isDev: false,
}

/** 安全创建目录 */
async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

/** 生成自动引入配置文件 */
async function generateConfigFiles(opts: Required<Options>) {
  const { prefix, iconsDir, excludes, outputFile } = opts
  const iconPath = resolve(process.cwd(), iconsDir)
  const outputDir = dirname(resolve(process.cwd(), outputFile))

  await ensureDir(outputDir)

  let iconsPath: string[] = []
  try {
    iconsPath = await fs.readdir(iconPath)
  } catch {
    console.warn(`⚠️ 图标目录不存在: ${iconPath}`)
    return
  }

  const iconNames = iconsPath
    .filter((i) => i.endsWith('.svg'))
    .map((i) => i.replace('.svg', ''))
    .filter((i) => !excludes.includes(i))

  const ctx = `/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// @unocss-include

export const iconList = [
${iconNames.map((iconName) => `  '${prefix}-${iconName}',`).join('\n')}
]
`
  await fs.writeFile(outputFile, ctx, 'utf-8')
  console.log(`✅ 自动生成图标配置文件: ${outputFile}（共 ${iconNames.length} 个图标）`)
}

/** 主入口 — 支持单配置或多配置 */
export default function (options: Options | Options[] = {}) {
  const optsArray = Array.isArray(options) ? options : [options]

  const resolvedOptions = optsArray.map((opt) => ({
    ...defaultOptions,
    ...opt,
  })) as Required<Options>[]

  // 执行生成逻辑
  for (const opts of resolvedOptions) {
    generateConfigFiles(opts)

    // 开发环境监听变化
    if (process.env.NODE_ENV === 'development' || opts.isDev) {
      const iconPath = resolve(process.cwd(), opts.iconsDir)
      const watcher = chokidar.watch(iconPath, { ignoreInitial: true })
      watcher.on('add', () => generateConfigFiles(opts))
      watcher.on('unlink', () => generateConfigFiles(opts))
    }
  }

  return {
    name: 'unocss-auto-svg',
  }
}
