// For further explanation on this awkward import/require syntax:
// https://github.com/uhop/node-re2/pull/53#issuecomment-537710741
// https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html#weeding-out-errors
import RE2 from 're2'
import { getType } from '@orioro/validate-type'

import { RegExpCandidate } from './types'
import { _stringMatch, _stringTest, _stringReplace } from './expressions'

const prepareRegExp = (regexpCandidate: RegExpCandidate): RE2 => {
  switch (getType(regexpCandidate)) {
    case 'string':
      return new RE2(regexpCandidate as string)
    case 'regexp':
      return new RE2(regexpCandidate as RegExp)
    case 'array':
      return new RE2(regexpCandidate[0], regexpCandidate[1])
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
