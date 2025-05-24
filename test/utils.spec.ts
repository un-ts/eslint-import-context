import path from 'node:path'

import { type Mock } from '@vitest/spy'
import * as getTsconfig from 'get-tsconfig'

import {
  FIXTURES_PATH,
  TEST_FILENAME,
  testContext,
  testFilePath,
} from './utils.js'

import type {
  getTsconfigWithContext as getTsconfigWithContext_,
  RuleContext,
} from 'eslint-import-context'

vi.mock('get-tsconfig', { spy: true })

const fakeContext = {
  ...testContext(),
  parserPath: '@babel/eslint-parser',
}

const createContext = (
  parserOptions: RuleContext['languageOptions']['parserOptions'] = {},
): RuleContext => ({
  ...testContext(),
  parserOptions,
})

const tsconfigRootDir = '/custom/root/dir'

describe('getTsconfigWithContext', () => {
  let spied: Mock

  let getTsconfigWithContext: typeof getTsconfigWithContext_

  const mockTsConfig: getTsconfig.TsConfigJsonResolved = {
    compilerOptions: { esModuleInterop: true },
  }

  beforeEach(async () => {
    vi.resetModules()
    spied = vi.mocked(getTsconfig.getTsconfig).mockReturnValue({
      path: testFilePath('tsconfig.json'),
      config: mockTsConfig,
    })
    ;({ getTsconfigWithContext } = await import('eslint-import-context'))
  })

  afterAll(() => {
    spied.mockRestore()
  })

  test('caches and returns the result for the same context', () => {
    // First call should use getTsconfig
    const result1 = getTsconfigWithContext(fakeContext)
    expect(spied).toHaveBeenCalledTimes(1)
    expect(result1).toBe(mockTsConfig)

    // Second call should use the cache
    const result2 = getTsconfigWithContext(fakeContext)
    expect(spied).toHaveBeenCalledTimes(1) // Still 1
    expect(result2).toBe(mockTsConfig)
  })

  // eslint-disable-line sonarjs/todo-tag -- TODO: enable in next major
  test.skip('falls back to `context.cwd` when tsconfigRootDir is not provided', () => {
    getTsconfigWithContext(fakeContext)
    expect(spied).toHaveBeenCalledWith(FIXTURES_PATH)
  })

  test('uses tsconfigRootDir when provided', () => {
    getTsconfigWithContext(createContext({ tsconfigRootDir }))
    expect(spied).toHaveBeenCalledWith(tsconfigRootDir)
  })

  test('resolves single project string path', () => {
    const project = 'tsconfig.custom.json'
    getTsconfigWithContext(createContext({ tsconfigRootDir, project }))
    expect(spied).toHaveBeenCalledWith(path.resolve(tsconfigRootDir, project))
  })

  test('uses physicalFilename when project is true', () => {
    const context = createContext({ project: true })
    getTsconfigWithContext(context)
    expect(spied).toHaveBeenCalledWith(TEST_FILENAME)
  })

  // eslint-disable-line sonarjs/fixme-tag -- FIXME: not sure why it's not working as expected
  test.skip('tries multiple projects until finding a valid one', () => {
    const projects = ['invalid.json', 'also-invalid.json', 'valid.json']
    const context = createContext({
      tsconfigRootDir,
      project: projects,
    })

    // Mock first two calls to return null (not found)
    spied
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce({ config: mockTsConfig })

    const result = getTsconfigWithContext(context)

    // Should have tried all three paths
    expect(spied).toHaveBeenNthCalledWith(
      1,
      path.resolve(tsconfigRootDir, projects[0]),
    )
    expect(spied).toHaveBeenNthCalledWith(
      2,
      path.resolve(tsconfigRootDir, projects[1]),
    )
    expect(spied).toHaveBeenNthCalledWith(
      3,
      path.resolve(tsconfigRootDir, projects[2]),
    )

    expect(result).toBe(mockTsConfig)
  })

  test('returns undefined when no tsconfig is found', () => {
    // Mock getTsconfig to return null (not found)
    spied.mockReturnValue(null)
    const result = getTsconfigWithContext(fakeContext)
    expect(result).toBeUndefined()
  })
})
