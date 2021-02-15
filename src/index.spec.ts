import {
  evaluate,
  STRING_EXPRESSIONS,
  VALUE_EXPRESSIONS,
} from '@orioro/expression'
import { REGEXP_EXPRESSIONS as BROWSER_REGEXP_EXPRESSIONS } from './index.browser'
import { REGEXP_EXPRESSIONS as NODE_REGEXP_EXPRESSIONS } from './index.node'

const COMMON_API = {
  $stringMatch: {
    'array notation - using regexp flags': (interpreters) => () => {
      const context = {
        interpreters,
        scope: { $$VALUE: 'abc_adc_acdc' },
      }

      expect(evaluate(context, ['$stringMatch', ['a.*?c', 'g']])).toEqual([
        'abc',
        'adc',
        'ac',
      ])

      expect(evaluate(context, ['$stringMatch', 'u'])).toEqual([])
    },
  },
  $stringTest: {
    basic: (interpreters) => () => {
      const context = {
        interpreters,
        scope: { $$VALUE: 'abc_adc_acdc' },
      }

      expect(evaluate(context, ['$stringTest', ['a.*?c', 'g']])).toEqual(true)

      expect(evaluate(context, ['$stringTest', 'u'])).toEqual(false)
    },
  },
  $stringReplace: {
    'string search - replaces only first match': (interpreters) => () => {
      const context = {
        interpreters,
        scope: { $$VALUE: 'abc_adc_acdc' },
      }

      expect(
        evaluate(context, ['$stringReplace', 'a', '--REPLACEMENT--'])
      ).toEqual('--REPLACEMENT--bc_adc_acdc')
    },

    'regexp search - using global (g) flag': (interpreters) => () => {
      const context = {
        interpreters,
        scope: { $$VALUE: 'abc_adc_acdc' },
      }

      expect(
        evaluate(context, ['$stringReplace', ['a', 'g'], '--REPLACEMENT--'])
      ).toEqual('--REPLACEMENT--bc_--REPLACEMENT--dc_--REPLACEMENT--cdc')
    },

    'regexp search - using replacement expression': (interpreters) => () => {
      const context = {
        interpreters,
        scope: { $$VALUE: 'abc_adc_acdc' },
      }

      expect(
        evaluate(context, [
          '$stringReplace',
          ['[a-c]', 'g'],
          ['$stringToUpperCase'],
        ])
      ).toEqual('ABC_AdC_ACdC')
    },
  },
}

const suiteCatastrophicBacktracking = (interpreters) => {
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
  })
}

describe('browser (based on JS Native RegExp)', () => {
  const interpreters = {
    ...VALUE_EXPRESSIONS,
    ...STRING_EXPRESSIONS,
    ...BROWSER_REGEXP_EXPRESSIONS,
  }

  Object.keys(COMMON_API).forEach((groupTitle) => {
    // eslint-disable-next-line jest/valid-title
    describe(groupTitle, () => {
      Object.keys(COMMON_API[groupTitle]).forEach((title) => {
        // eslint-disable-next-line jest/valid-title, jest/expect-expect
        test(title, COMMON_API[groupTitle][title](interpreters))
      })
    })
  })

  // To see performance issues related to catastrophic backtracking:
  // suiteCatastrophicBacktracking(interpreters)
})

describe('node (based on RE2)', () => {
  const interpreters = {
    ...VALUE_EXPRESSIONS,
    ...STRING_EXPRESSIONS,
    ...NODE_REGEXP_EXPRESSIONS,
  }

  Object.keys(COMMON_API).forEach((groupTitle) => {
    // eslint-disable-next-line jest/valid-title
    describe(groupTitle, () => {
      Object.keys(COMMON_API[groupTitle]).forEach((title) => {
        // eslint-disable-next-line jest/valid-title, jest/expect-expect
        test(title, COMMON_API[groupTitle][title](interpreters))
      })
    })
  })

  suiteCatastrophicBacktracking(interpreters)
})
