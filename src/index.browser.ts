import { getType } from '@orioro/validate-type'

import { RegExpCandidate } from './types'
import { _stringMatch, _stringTest, _stringReplace } from './expressions'

const prepareRegExp = (regexpCandidate: RegExpCandidate): RegExp => {
  switch (getType(regexpCandidate)) {
    case 'string':
      return new RegExp(regexpCandidate as string)
    case 'array':
      return new RegExp(regexpCandidate[0], regexpCandidate[1])
    case 'regexp':
      return regexpCandidate as RegExp
    default:
      throw new TypeError(`Invalid RegExp candidate: ${regexpCandidate}`)
  }
}

export const $stringMatch = _stringMatch(prepareRegExp)
export const $stringTest = _stringTest(prepareRegExp)
export const $stringReplace = _stringReplace(prepareRegExp)

export const REGEXP_EXPRESSIONS = {
  $stringMatch,
  $stringTest,
  $stringReplace,
}
