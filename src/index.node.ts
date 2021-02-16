// For further explanation on this awkward import/require syntax:
// https://github.com/uhop/node-re2/pull/53#issuecomment-537710741
// https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html#weeding-out-errors
import RE2 from 're2'
import { getType } from '@orioro/validate-type'

import { RegExpCandidate } from './types'
import { prepareExpressions } from './expressions'

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

export const REGEXP_EXPRESSIONS = prepareExpressions(prepareRegExp)

export const {
  $stringMatch,
  $stringTest,
  $stringReplace,
  $stringSplit,
} = REGEXP_EXPRESSIONS
