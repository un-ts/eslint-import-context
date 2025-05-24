import path from 'node:path'

import type { PluginSettings, RuleContext } from 'eslint-import-context'

export const FIXTURES_PATH = path.resolve('test/fixtures')

export function testFilePath(relativePath = 'foo.js') {
  return path.resolve(FIXTURES_PATH, relativePath)
}

export const TEST_FILENAME = testFilePath()

export function testContext(settings?: PluginSettings) {
  return {
    cwd: FIXTURES_PATH,
    physicalFilename: TEST_FILENAME,
    settings: settings || {},
  } as RuleContext
}
