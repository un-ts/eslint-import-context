import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      'eslint-import-context': new URL('src/index.ts', import.meta.url)
        .pathname,
    },
  },
  test: {
    globals: true,
    coverage: {
      enabled: true,
      include: ['src'],
      reporter: ['lcov', 'json', 'text'],
    },
  },
})
