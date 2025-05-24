import { testContext } from './utils.js'

import { setRuleContext, useRuleContext } from 'eslint-import-context'

describe('context', () => {
  it('should just work', () => {
    expect(useRuleContext()).toBeUndefined()

    const context = testContext()
    const result = setRuleContext(context, () => {
      expect(useRuleContext()).toBe(context)
      return 'test'
    })
    expect(result).toBe('test')
    expect(useRuleContext()).toBeUndefined()
  })
})
