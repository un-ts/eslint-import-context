import type { TSESLint } from '@typescript-eslint/utils'
import type { NapiResolveOptions } from 'oxc-resolver'
import type { KebabCase, LiteralUnion } from 'type-fest'

import type { PluginName } from './utils.js'

export type FileExtension = `.${string}`

export type DocStyle = 'jsdoc' | 'tomdoc'

export interface ResultNotFound {
  found: false
  // eslint-disable-next-line sonarjs/no-redundant-optional
  path?: undefined
}

export interface ResultFound {
  found: true
  path: string | null
}

// eslint-disable-line sonarjs/todo-tag -- TODO: remove prefix New in the next major version
export type NewResolverResolve = (
  modulePath: string,
  sourceFile: string,
) => ResolvedResult

// eslint-disable-line sonarjs/todo-tag -- TODO: remove prefix New in the next major version
export interface NewResolver {
  interfaceVersion: 3
  /** Optional name for the resolver, this is used in logs/debug output */
  name?: string
  resolve: NewResolverResolve
}

export type Resolver = LegacyResolver | NewResolver

export type ResolvedResult = ResultFound | ResultNotFound

// based on https://github.com/DefinitelyTyped/DefinitelyTyped/blob/157f2565d64cbc03165a2284bf0e5176af18d991/types/resolve/index.d.ts#L93-L122
export interface NodeResolverOptions
  extends Omit<NapiResolveOptions, 'extensions'> {
  /** Directory to begin resolving from (defaults to __dirname) */
  basedir?: string
  /** Set to false to exclude node core modules (e.g. fs) from the search */
  includeCoreModules?: boolean
  /** Array of file extensions to search in order (defaults to ['.js']) */
  extensions?: string | readonly string[]
  /**
   * Require.paths array to use if nothing is found on the normal node_modules
   * recursive walk (probably don't use this)
   */
  paths?: string | readonly string[]
  /**
   * Directory (or directories) in which to recursively look for modules.
   * (default to 'node_modules')
   */
  moduleDirectory?: string | readonly string[]
  /**
   * If true, doesn't resolve `basedir` to real path before resolving. This is
   * the way Node resolves dependencies when executed with the
   * --preserve-symlinks flag.
   *
   * Note: this property is currently true by default but it will be changed to
   * false in the next major version because Node's resolution algorithm does
   * not preserve symlinks by default.
   */
  preserveSymlinks?: boolean

  // The following options are not supported anymore, but kept for compatibility
  /** @deprecated */
  package?: unknown
  /** @deprecated */
  packageFilter?: unknown
  /** @deprecated */
  pathFilter?: unknown
  /** @deprecated */
  packageIterator?: unknown
}

export interface WebpackResolverOptions {
  config?: string | { resolve: NapiResolveOptions }
  'config-index'?: number
  env?: Record<string, unknown>
  argv?: Record<string, unknown>
}

export interface TsResolverOptions extends NapiResolveOptions {
  alwaysTryTypes?: boolean
  project?: string[] | string
  extensions?: string[]
}

export type LegacyResolverName = LiteralUnion<
  'node' | 'typescript' | 'webpack',
  string
>

export type LegacyResolverResolveImport<T = unknown> = (
  modulePath: string,
  sourceFile: string,
  config: T,
) => string | undefined

export type LegacyResolverResolve<T = unknown> = (
  modulePath: string,
  sourceFile: string,
  config: T,
) => ResolvedResult

export interface LegacyResolverV1<T> {
  interfaceVersion?: 1
  resolveImport: LegacyResolverResolveImport<T>
}

export interface LegacyResolverV2<T> {
  interfaceVersion: 2
  resolve: LegacyResolverResolve<T>
}

export type LegacyResolver<T = unknown, U = T> =
  | LegacyResolverV1<U>
  | LegacyResolverV2<T>

export interface LegacyResolverObjectBase {
  // node, typescript, webpack...
  name: LegacyResolverName

  // Enabled by default
  enable?: boolean

  // Options passed to the resolver
  options?: unknown

  // Any object satisfied Resolver type
  resolver: LegacyResolver
}

export interface LegacyNodeResolverObject extends LegacyResolverObjectBase {
  name: 'node'
  options?: NodeResolverOptions | boolean
}

export interface LegacyTsResolverObject extends LegacyResolverObjectBase {
  name: 'typescript'
  options?: TsResolverOptions | boolean
}

export interface LegacyWebpackResolverObject extends LegacyResolverObjectBase {
  name: 'webpack'
  options?: WebpackResolverOptions | boolean
}

export type LegacyResolverObject =
  | LegacyNodeResolverObject
  | LegacyResolverObjectBase
  | LegacyTsResolverObject
  | LegacyWebpackResolverObject

export interface LegacyResolverRecord {
  [resolve: string]: unknown
  node?: NodeResolverOptions | boolean
  typescript?: TsResolverOptions | boolean
  webpack?: WebpackResolverOptions | boolean
}

export type LegacyImportResolver =
  | LegacyResolverName
  | LegacyResolverName[]
  | LegacyResolverObject
  | LegacyResolverObject[]
  | LegacyResolverRecord
  | LegacyResolverRecord[]

export interface ImportSettings {
  cache?: {
    lifetime?: number | '∞' | 'Infinity'
  }
  coreModules?: string[]
  docstyle?: DocStyle[]
  extensions?: readonly FileExtension[]
  externalModuleFolders?: string[]
  ignore?: string[]
  internalRegex?: string
  parsers?: Record<string, readonly FileExtension[]>
  resolve?: NodeResolverOptions
  resolver?: LegacyImportResolver
  'resolver-legacy'?: LegacyImportResolver
  'resolver-next'?: NewResolver | NewResolver[]
}

export type WithPluginName<T extends object | string> = T extends string
  ? `${PluginName}/${KebabCase<T>}`
  : {
      [K in keyof T as WithPluginName<`${KebabCase<K & string>}`>]: T[K]
    }

export type PluginSettings = WithPluginName<ImportSettings>

export interface RuleContext<
  TMessageIds extends string = string,
  TOptions extends readonly unknown[] = readonly unknown[],
> extends Omit<TSESLint.RuleContext<TMessageIds, TOptions>, 'settings'> {
  settings: PluginSettings
}

export interface ChildContext {
  cacheKey: string
  settings: PluginSettings
  parserPath?: string | null
  parserOptions?: TSESLint.ParserOptions
  languageOptions?: TSESLint.FlatConfig.LanguageOptions
  path: string
  cwd: string
  filename: string
  physicalFilename: string
}
