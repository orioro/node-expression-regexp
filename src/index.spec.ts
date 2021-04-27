import {
  interpreterList,
  evaluate,
  STRING_EXPRESSIONS,
  VALUE_EXPRESSIONS,
} from '@orioro/expression'
import { REGEXP_EXPRESSIONS as BROWSER_REGEXP_EXPRESSIONS } from './index.browser'
import { REGEXP_EXPRESSIONS as NODE_REGEXP_EXPRESSIONS } from './index.node'

import { prepareEvaluateTestCases } from '@orioro/jest-util-expression'

const COMMON_API = {
  $stringMatch: {
    'array notation - using regexp flags': ({ testAllCases }) => () => {
      const value = 'abc_adc_acdc'

      testAllCases([
        [value, ['$stringMatch', ['a.*?c', 'g']], ['abc', 'adc', 'ac']],
        [value, ['$stringMatch', 'u'], []],
      ])
    },
  },
  $stringTest: {
    basic: ({ testAllCases }) => () => {
      const value = 'abc_adc_acdc'

      testAllCases([
        [value, ['$stringTest', ['a.*?c', 'g']], true],
        [value, ['$stringTest', 'u'], false],
      ])
    },
  },
  $stringReplace: {
    'string search - replaces only first match': ({ testAllCases }) => () => {
      const value = 'abc_adc_acdc'

      testAllCases([
        [
          value,
          ['$stringReplace', 'a', '--REPLACEMENT--'],
          '--REPLACEMENT--bc_adc_acdc',
        ],
      ])
    },

    'regexp search - using global (g) flag': ({ testAllCases }) => () => {
      const value = 'abc_adc_acdc'

      testAllCases([
        [
          value,
          ['$stringReplace', ['a', 'g'], '--REPLACEMENT--'],
          '--REPLACEMENT--bc_--REPLACEMENT--dc_--REPLACEMENT--cdc',
        ],
      ])
    },

    'regexp search - using replacement expression': ({
      testAllCases,
    }) => () => {
      const value = 'abc_adc_acdc'

      testAllCases([
        [
          value,
          ['$stringReplace', ['[a-c]', 'g'], ['$stringToUpperCase']],
          'ABC_AdC_ACdC',
        ],
      ])
    },
  },
  $stringSplit: {
    'split on simple string': ({ testAllCases }) => () => {
      const value = 'Maçãs, laranjas, uvas e melões'

      testAllCases([
        [
          value,
          ['$stringSplit', ' '],
          ['Maçãs,', 'laranjas,', 'uvas', 'e', 'melões'],
        ],
        [value, ['$stringSplit', '_'], [value]], // no change
      ])
    },
    'split on regexp': ({ testAllCases }) => () => {
      const value = 'Maçãs, laranjas, uvas e melões'

      testAllCases([
        [
          value,
          ['$stringSplit', '\\s*[,e]\\s+'],
          ['Maçãs', 'laranjas', 'uvas', 'melões'],
        ],
      ])
    },
  },

  'regexp formats': {
    string: ({ testAllCases }) => () => {
      const value = 'abc_adc_acdc'

      testAllCases([
        [value, ['$stringTest', 'a'], true],
        [value, ['$stringTest', 'A'], false],
      ])
    },
    array: ({ testAllCases }) => () => {
      const value = 'abc_adc_acdc'

      testAllCases([
        [value, ['$stringTest', ['a']], true],
        [value, ['$stringTest', ['A']], false],
        [value, ['$stringTest', ['A', 'i']], true],
      ])
    },
    regexp: ({ testAllCases }) => () => {
      const value = 'abc_adc_acdc'

      testAllCases([
        [value, ['$stringTest', /a/], true],
        [value, ['$stringTest', /A/], false],
        [value, ['$stringTest', /A/i], true],
      ])
    },
    unknown: ({ testAllCases }) => () => {
      const value = 'abc_adc_acdc_999'

      testAllCases([
        [value, ['$stringTest', '9'], true],
        [value, ['$stringTest', 9], TypeError],
        [value, ['$stringTest', [9]], TypeError],
        [value, ['$stringTest', ['9', 9]], TypeError],
      ])
    },
  },
}

const suiteCatastrophicBacktracking = ({ interpreters }) => {
  describe('catastrophic backtracking (to be sure no RegExp-based code on node version)', () => {
    // See
    // https://javascript.info/regexp-catastrophic-backtracking#preventing-backtracking
    const context = {
      interpreters,
      scope: { $$VALUE: '012345678901234567890123456789z' },
    }

    test('$stringMatch', () => {
      const start = Date.now()
      expect(evaluate(context, ['$stringMatch', '^(\\d+)*$'])).toEqual([])
      const end = Date.now()

      // Takes over 30s on RegExp-based implementation
      // console.log(`took ${(end - start) / 1000} seconds`)

      expect(end - start).toBeLessThan(50)
    })

    test('$stringTest', () => {
      const start = Date.now()
      expect(evaluate(context, ['$stringTest', '^(\\d+)*$'])).toEqual(false)
      const end = Date.now()

      // Takes over 30s on RegExp-based implementation
      // console.log(`took ${(end - start) / 1000} seconds`)

      expect(end - start).toBeLessThan(50)
    })

    test('$stringReplace', () => {
      const start = Date.now()
      expect(
        evaluate(context, [
          '$stringReplace',
          '^(\\d+)*$',
          '<<< REPLACEMENT >>>',
        ])
      ).toEqual(context.scope.$$VALUE) // no change
      const end = Date.now()

      // Takes over 30s on RegExp-based implementation
      // console.log(`took ${(end - start) / 1000} seconds`)

      expect(end - start).toBeLessThan(50)
    })

    test('$stringSplit', () => {
      const start = Date.now()
      expect(evaluate(context, ['$stringSplit', '^(\\d+)*$'])).toEqual([
        context.scope.$$VALUE,
      ]) // no change
      const end = Date.now()

      // Takes over 30s on RegExp-based implementation
      // console.log(`took ${(end - start) / 1000} seconds`)

      expect(end - start).toBeLessThan(50)
    })
  })
}

describe('browser (based on JS Native RegExp)', () => {
  const testAllCases = prepareEvaluateTestCases({
    ...VALUE_EXPRESSIONS,
    ...STRING_EXPRESSIONS,
    ...BROWSER_REGEXP_EXPRESSIONS,
  })

  Object.keys(COMMON_API).forEach((groupTitle) => {
    // eslint-disable-next-line jest/valid-title
    describe(groupTitle, () => {
      Object.keys(COMMON_API[groupTitle]).forEach((title) => {
        // eslint-disable-next-line jest/valid-title, jest/valid-describe
        describe(title, COMMON_API[groupTitle][title]({ testAllCases }))
      })
    })
  })

  // To see performance issues related to catastrophic backtracking:
  // suiteCatastrophicBacktracking({ testAllCases })
})

describe('node (based on RE2)', () => {
  const interpreterSpecs = {
    ...VALUE_EXPRESSIONS,
    ...STRING_EXPRESSIONS,
    ...NODE_REGEXP_EXPRESSIONS,
  }
  const testAllCases = prepareEvaluateTestCases(interpreterSpecs)

  Object.keys(COMMON_API).forEach((groupTitle) => {
    // eslint-disable-next-line jest/valid-title
    describe(groupTitle, () => {
      Object.keys(COMMON_API[groupTitle]).forEach((title) => {
        // eslint-disable-next-line jest/valid-title, jest/valid-describe
        describe(title, COMMON_API[groupTitle][title]({ testAllCases }))
      })
    })
  })

  suiteCatastrophicBacktracking({
    testAllCases,
    interpreters: interpreterList(interpreterSpecs),
  })
})
