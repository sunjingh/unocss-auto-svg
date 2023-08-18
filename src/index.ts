import { promises as fs } from 'fs'
import { resolve } from 'path'
import chokidar from 'chokidar'

type Options = Partial<{
  prefix: string
  iconsDir: string
  excludes: string[]
  outputFile: string
}>

const defaultOptions: Options = {
  prefix: 'i-icon',
  iconsDir: 'src/icons',
  excludes: [],
  outputFile: 'src/helper/unocss-auto-svg.ts',
}

export default function (options: Options = {}) {
  options = { ...defaultOptions, ...options }

  const { prefix, iconsDir, excludes, outputFile } = options as Required<Options>
  const iconPath = resolve(process.cwd(), iconsDir)
  const outputDir = outputFile.replace(/(\/[^/]*).ts/, '')
  fs.readdir(outputDir).catch(() => fs.mkdir(outputDir))

  async function generateConfigFiles() {
    const iconsPath = await fs.readdir(iconPath)

    const iconNames = iconsPath
      .filter((i) => i.endsWith('.svg'))
      .map((i) => i.replace('.svg', ''))
      .filter((i) => !excludes.includes(i))

    const ctx = `
/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// @unocss-include

export const iconList = [
${iconNames.reduce((str, iconName, index, arr) => {
  if (index !== arr.length - 1) str += `'${prefix}-${iconName}',\n`
  else str += `'${prefix}-${iconName}'`
  return str
}, '')}
]`
    fs.writeFile(outputFile, ctx, 'utf-8')
  }

  generateConfigFiles()
  const watcher = chokidar.watch(iconPath)
  watcher.on('add', () => generateConfigFiles())
  watcher.on('unlink', () => generateConfigFiles())

  return {
    name: 'unocss-auto-svg',
  }
}
