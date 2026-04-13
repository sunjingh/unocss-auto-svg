import { promises as fs } from 'fs'
import { resolve, dirname, basename } from 'path'
import chokidar from 'chokidar'
import fg from 'fast-glob'

type Options = Partial<{
  prefix: string
  iconsDir: string | string[]
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

/** 判断是否为 glob 模式 */
function isGlobPattern(str: string): boolean {
  return /[*?{}[\]]/.test(str)
}

/** 收集目录下的图标 */
async function collectIcons(
  dirOrGlob: string,
  prefix: string,
  excludes: string[],
): Promise<string[]> {
  const cwd = process.cwd()
  let svgFiles: string[]

  if (isGlobPattern(dirOrGlob)) {
    svgFiles = await fg.glob(`${dirOrGlob}/**/*.svg`, {
      cwd,
      onlyFiles: true,
      absolute: true,
    })
  } else {
    const absDir = resolve(cwd, dirOrGlob)
    svgFiles = await fg.glob('**/*.svg', {
      cwd: absDir,
      onlyFiles: true,
      absolute: true,
    })
  }

  return svgFiles
    .map((f) => {
      const name = basename(f, '.svg')
      if (excludes.includes(name)) return null

      const componentMatch = f.match(/components[\/\\](.+?)[\/\\]icons[\/\\]/)
      if (componentMatch) {
        const parts = componentMatch[1].split(/[\/\\]/).map((p) => p.replace(/-/g, '_'))
        return `${prefix}-${parts.join('_')}-${name}`
      }
      return `${prefix}-${name}`
    })
    .filter((item): item is string => item !== null)
}

/** 生成自动引入配置文件 */
async function generateConfigFiles(opts: Required<Options>) {
  const { prefix, iconsDir, excludes, outputFile } = opts
  const outputDir = dirname(resolve(process.cwd(), outputFile))

  await ensureDir(outputDir)

  const dirs = Array.isArray(iconsDir) ? iconsDir : [iconsDir]
  const iconSets = await Promise.all(dirs.map((dir) => collectIcons(dir, prefix, excludes)))
  const allIcons = [...new Set(iconSets.flat())]

  const ctx = `/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// @unocss-include

export const iconList = [
${allIcons.map((icon) => `  '${icon}',`).join('\n')}
]
`
  await fs.writeFile(outputFile, ctx, 'utf-8')
  console.log(`✅ 自动生成图标配置文件: ${outputFile}（共 ${allIcons.length} 个图标）`)
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
      const dirs = Array.isArray(opts.iconsDir) ? opts.iconsDir : [opts.iconsDir]
      const watchPaths = dirs.map((dir) => {
        if (isGlobPattern(dir)) {
          return resolve(process.cwd(), dir)
        }
        return resolve(process.cwd(), dir)
      })
      const watcher = chokidar.watch(watchPaths, { ignoreInitial: true })
      watcher.on('add', () => generateConfigFiles(opts))
      watcher.on('unlink', () => generateConfigFiles(opts))
    }
  }

  return {
    name: 'unocss-auto-svg',
  }
}
