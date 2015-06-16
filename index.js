/*
 * Module dependencies
 */
var balanced = require("balanced-match")

/**
 * Expose `reduceFunctionCall`
 *
 * @type {Function}
 */
module.exports = reduceFunctionCall

/**
 * Walkthrough all expressions, evaluate them and insert them into the declaration
 *
 * @param {Array} expressions
 * @param {Object} declaration
 */

function reduceFunctionCall(string, regex, callback) {
  var calls = getFunctionCalls(string, regex)
  return calls.reduce(function(sequence, call) {
    return sequence.then(function() {
      var transform = callback(call.matches.body, call.functionIdentifier, string)
      return Promise.resolve(transform).then(function(replacement) {
        var target = call.functionIdentifier + "(" + call.matches.body + ")"
        string = string.replace(target, replacement)
        return string
      })
    })
  }, Promise.resolve())
}

/**
 * Parses expressions in a value
 *
 * @param {String} value
 * @returns {Array}
 * @api private
 */

function getFunctionCalls(call, functionRE) {
  var expressions = []

  var fnRE = typeof functionRE === "string" ? new RegExp("\\b(" + functionRE + ")\\(") : functionRE
  do {
    var searchMatch = fnRE.exec(call)
    if (!searchMatch) {
      return expressions
    }
    if (searchMatch[1] === undefined) {
      throw new Error("Missing the first couple of parenthesis to get the function identifier in " + functionRE)
    }
    var fn = searchMatch[1]
    var startIndex = searchMatch.index
    var matches = balanced("(", ")", call.substring(startIndex))

    if (!matches) {
      throw new SyntaxError(fn + "(): missing closing ')' in the value '" + call + "'")
    }

    expressions.push({matches: matches, functionIdentifier: fn})
    call = matches.post
  }
  while (fnRE.test(call))

  return expressions
}
