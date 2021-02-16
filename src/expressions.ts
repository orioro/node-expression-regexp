import {
  interpreter,
  evaluateTyped,
  Expression,
  EvaluationContext,
  ExpressionInterpreter,
  ExpressionInterpreterList,
} from '@orioro/expression'
import { RegExpCandidate } from './types'

type PrepareRegExpInterface = (regexpCandidate: RegExpCandidate) => RegExp

/**
 * @function $stringMatch
 * @param {String | [String, String?]} regexp
 * @param {String} [value=$$VALUE]
 * @returns {String[]}
 */
export const _stringMatch = (
  prepareRegExp: PrepareRegExpInterface
): ExpressionInterpreter =>
  interpreter(
    (regexpCandidate: RegExpCandidate, value: string): string[] => {
      const match = value.match(prepareRegExp(regexpCandidate))

      return match === null ? [] : [...match]
    },
    [['string', 'regexp', 'array'], 'string']
  )

/**
 * @function $stringTest
 * @param {String | [String, String?]} regexp
 * @param {String} [value=$$VALUE]
 * @returns {Boolean}
 */
export const _stringTest = (
  prepareRegExp: PrepareRegExpInterface
): ExpressionInterpreter =>
  interpreter(
    (regexpCandidate: RegExpCandidate, value: string): boolean =>
      prepareRegExp(regexpCandidate).test(value),
    [['string', 'regexp', 'array'], 'string']
  )

/**
 * @function $stringReplace
 * @param {String | [String, String?]} searchExp
 * @param {String} replacementExp
 * @returns {String}
 */
export const _stringReplace = (
  prepareRegExp: PrepareRegExpInterface
): ExpressionInterpreter =>
  interpreter(
    (
      search: RegExpCandidate,
      replacementExp: Expression,
      value: string,
      context: EvaluationContext
    ): string =>
      value.replace(prepareRegExp(search), (match) =>
        evaluateTyped(
          'string',
          {
            ...context,
            scope: {
              $$VALUE: match,
              $$PARENT_SCOPE: context.scope,
            },
          },
          replacementExp
        )
      ),
    [['string', 'regexp', 'array'], null, 'string']
  )

/**
 * @function $stringSplit
 * @param {String | [String, String?]} regexp
 * @param {String} [value=$$VALUE]
 * @returns {String[]}
 */
export const _stringSplit = (
  prepareRegExp: PrepareRegExpInterface
): ExpressionInterpreter =>
  interpreter(
    (regexpCandidate: RegExpCandidate, value: string): string[] =>
      value.split(prepareRegExp(regexpCandidate)),
    [['string', 'regexp', 'array'], 'string']
  )

export const prepareExpressions = (
  prepareRegExp: PrepareRegExpInterface
): ExpressionInterpreterList => ({
  $stringMatch: _stringMatch(prepareRegExp),
  $stringTest: _stringTest(prepareRegExp),
  $stringReplace: _stringReplace(prepareRegExp),
  $stringSplit: _stringSplit(prepareRegExp),
})
