# regexpExpressions

```
npm install @orioro/regexp-expressions
yarn add @orioro/regexp-expressions
```
Previously the expressions defined in this module were available in the built-in expressions at
@orioro/expression module. Due to risks related to RegExp Denial of Service (ReDoS), all expressions
that took regexps as input ($stringMatch, $stringTest and $stringReplace) were isolated. As a manner
of mitigation, this module provides 2 distinct builds, one targeted at Node.js (which uses RE2
https://github.com/uhop/node-re2/) and one targeted at the Browser (which uses JS built-in RegExp
constructor). The Node.js build should be safe against ReDoS due to the protection offered by RE2
project.

# API Docs

- [`$stringMatch(regexp, value)`](#stringmatchregexp-value)
- [`$stringTest(regexp, value)`](#stringtestregexp-value)
- [`$stringReplace(searchExp, replacementExp)`](#stringreplacesearchexp-replacementexp)
- [`$stringSplit(regexp, value)`](#stringsplitregexp-value)

##### `$stringMatch(regexp, value)`

- `regexp` {String | [String, String?]}
- `value` {String}
- Returns: {String[]} 

##### `$stringTest(regexp, value)`

- `regexp` {String | [String, String?]}
- `value` {String}
- Returns: {Boolean} 

##### `$stringReplace(searchExp, replacementExp)`

- `searchExp` {String | [String, String?]}
- `replacementExp` {String}
- Returns: {String} 

##### `$stringSplit(regexp, value)`

- `regexp` {String | [String, String?]}
- `value` {String}
- Returns: {String[]}
