import { getType, validateType } from '@orioro/typing'

import { RegExpCandidate } from './types'
import { prepareExpressions } from './expressions'

const prepareRegExp = (regexpCandidate: RegExpCandidate): RegExp => {
  switch (getType(regexpCandidate)) {
    case 'string':
      return new RegExp(regexpCandidate as string)
    case 'array': {
      validateType('string', regexpCandidate[0])
      validateType(['string', 'undefined'], regexpCandidate[1])
      return new RegExp(regexpCandidate[0], regexpCandidate[1])
    }
    case 'regexp':
      return regexpCandidate as RegExp
    /* istanbul ignore next */
    default:
      throw new TypeError(`Invalid RegExp candidate: ${regexpCandidate}`)
  }
}

export const REGEXP_EXPRESSIONS = prepareExpressions(prepareRegExp)

export const {
  $stringMatch,
  $stringTest,
  $stringReplace,
  $stringSplit,
} = REGEXP_EXPRESSIONS
