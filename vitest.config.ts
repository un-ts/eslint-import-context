import path from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      'eslint-import-context': path.resolve(__dirname, 'src/index.ts'),
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
