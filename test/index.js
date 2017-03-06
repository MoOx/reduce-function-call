var test = require("tape")

var reduceFunctionCall = require("..")

test("SyntaxError if parentheses are missing", function(t) {
  t.throws(function() { reduceFunctionCall("foo(", "foo")}, SyntaxError)
  t.throws(function() { reduceFunctionCall("bar((2 + 1)", "bar")}, SyntaxError)
  t.throws(function() { reduceFunctionCall("sha blah(blah(2 + 1) yep()", "blah")}, SyntaxError)
  t.end()
})

test("reduce simple function calls", function(t) {
  t.plan(3)

  reduceFunctionCall("foo(1)", "foo", function(body) {
    // body === "1"
    return parseInt(body, 10) + 1
  }).then(function(result) {
    t.equal(result, "2", "should work for a simple replacement")
  })

  reduceFunctionCall("bar()", "bar", function(body, functionIdentifier, call) {
    // ignore empty value
    if (body === "") {
      return call
    }
    // do other things if there is a body
    return body
  }).then(function(result) {
    t.equal(result, "bar()", "should work with no arguments")
  })

  var sum = 0
  reduceFunctionCall("sha cumul(4) blah blah cumul(2) foo() cumul(2)", "cumul", function(body) {
    sum += parseInt(body, 10)
    return sum
  }).then(function(result) {
    t.equal(result, "sha 4 blah blah 6 foo() 8", "should only replace first occurence when there are multiple occurence of a same call")
  })
})

test("recursivity", function(t) {
  t.plan(1)
  reduceFunctionCall("math(math(2 + 2) * 4 + math(2 + 2)) and other things", "math", function(body, functionIdentifier, call) {
    try {
      return eval(body)
    }
    catch (e) {
      return call
    }
  }).then(function(result) {
    t.equal(result, "20 and other things", "should work with recursive calls")
  })
  /*
  t.equal(reduceFunctionCall("math(math(2 + 2) * 4 + math(2 + 2)) and other things", "math", function(body, functionIdentifier, call) {
    try {
      return eval(body)
    }
    catch (e) {
      return call
    }
  }), "20 and other things", "should work with recursive calls")
  t.end()*/
})

test("RegExp", function(t) {
  t.equal(reduceFunctionCall("sha bla blah(abla()) blaa bla() abla() aabla() blaaa()", /\b([a-z]?bla[a-z]?)\(/, function(body, functionIdentifier) {
    if (functionIdentifier === "bla") {
      return "ABRACADABLA"
    }
    return functionIdentifier.toUpperCase() + "{" + body + "}"
  }), "sha bla BLAH{ABLA{}} blaa ABRACADABLA ABLA{} aabla() blaaa()", "should support with regular expressions")

  t.throws(function() { reduceFunctionCall("blaa()", /\b[a-z]?bla[a-z]?\(/) }, Error, "should throw an error if RegExp doesn't have at least a couple of parenthesis to catch the identifier name")
  t.end()
})
