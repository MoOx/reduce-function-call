# reduce-function-call [![Build Status](https://travis-ci.org/MoOx/reduce-function-call.png)](https://travis-ci.org/MoOx/reduce-function-call)

> Reduce function calls in a string, using a callback

<a target='_blank' rel='nofollow' href='https://app.codesponsor.io/link/6RNUx3a3Vj2k5iApeppsc9L9/MoOx/reduce-function-call'>
  <img alt='Sponsor' width='888' height='68' src='https://app.codesponsor.io/embed/6RNUx3a3Vj2k5iApeppsc9L9/MoOx/reduce-function-call.svg' />
</a>

## Installation

```bash
npm install reduce-function-call
```

## Usage

```js
var reduceFunctionCall = require("reduce-function-call")

reduceFunctionCall("foo(1)", "foo", function(body) {
  // body === "1"
  return parseInt(body, 10) + 1
})
// "2"

var nothingOrUpper = function(body, functionIdentifier) {
  // ignore empty value
  if (body === "") {
    return functionIdentifier + "()"
  }

  return body.toUpperCase()
}

reduceFunctionCall("bar()", "bar", nothingOrUpper)
// "bar()"

reduceFunctionCall("upper(baz)", "upper", nothingOrUpper)
// "BAZ"

reduceFunctionCall("math(math(2 + 2) * 4 + math(2 + 2)) and other things", "math", function(body, functionIdentifier, call) {
  try {
    return eval(body)
  }
  catch (e) {
    return call
  }
})
// "20 and other things"

reduceFunctionCall("sha bla blah() blaa bla() abla() aabla() blaaa()", /\b([a-z]?bla[a-z]?)\(/, function(body, functionIdentifier) {
  if (functionIdentifier === "bla") {
    return "ABRACADABRA"
  }
  return functionIdentifier.replace("bla", "!")
}
// "sha bla !h blaa ABRACADABRA a! aabla() blaaa()"
```

See [unit tests](test/index.js) for others examples.

## Contributing

Work on a branch, install dev-dependencies, respect coding style & run tests before submitting a bug fix or a feature.

```bash
git clone https://github.com/MoOx/reduce-function-call.git
git checkout -b patch-1
npm install
npm test
```

## [Changelog](CHANGELOG.md)

## [License](LICENSE-MIT)
