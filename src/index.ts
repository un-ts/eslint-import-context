import type { ChildContext, RuleContext } from './types.js'

export type * from './types.js'
export * from './utils.js'

let ruleContext: ChildContext | RuleContext | undefined

export const setRuleContext = <T = void>(
  nextRuleContext: ChildContext | RuleContext,
  callback: () => T,
) => {
  const currentValue = ruleContext
  ruleContext = nextRuleContext
  const result = callback()
  ruleContext = currentValue
  return result
}

export const useRuleContext = () => ruleContext
