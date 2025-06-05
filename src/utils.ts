import path from 'node:path'

import { getTsconfig } from 'get-tsconfig'
import type { TsConfigJsonResolved, TsConfigResult } from 'get-tsconfig'
import { stableHash } from 'stable-hash-x'

import type { ChildContext, RuleContext } from './types.js'

export const pluginName = 'import-x'

export type PluginName = typeof pluginName

const tsconfigCache = new Map<string, TsConfigJsonResolved | null | undefined>()

// eslint-disable-next-line sonarjs/cognitive-complexity
export function getTsconfigWithContext(context: ChildContext | RuleContext) {
  const parserOptions =
    context.languageOptions?.parserOptions || context.parserOptions
  let tsconfigRootDir = parserOptions?.tsconfigRootDir
  const project = parserOptions?.project
  const cacheKey = stableHash([tsconfigRootDir, project])
  let tsconfig: TsConfigJsonResolved | null | undefined
  if (tsconfigCache.has(cacheKey)) {
    tsconfig = tsconfigCache.get(cacheKey)
  } else {
    tsconfigRootDir =
      tsconfigRootDir ||
      // eslint-disable-line sonarjs/todo-tag -- TODO: uncomment in next major
      // || context.cwd
      process.cwd()
    let tsconfigResult: TsConfigResult | null | undefined
    if (project) {
      const projects = Array.isArray(project) ? project : [project]
      for (const project of projects) {
        tsconfigResult = getTsconfig(
          project === true
            ? context.physicalFilename
            : path.resolve(tsconfigRootDir, project),
        )
        if (tsconfigResult) {
          break
        }
      }
    } else {
      tsconfigResult = getTsconfig(tsconfigRootDir)
    }
    tsconfig = tsconfigResult?.config
    tsconfigCache.set(cacheKey, tsconfig)
  }
  return tsconfig
}
