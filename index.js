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

function reduceFunctionCall(string, functionIdentifier, callback) {
  var call = string
  return getFunctionCalls(string, functionIdentifier).reduce(function(string, obj) {
    return string.replace(obj.functionIdentifier + "(" + obj.matches.body + ")", evalFunctionCall(obj.matches.body, obj.functionIdentifier, callback, call))
  }, string)
}

/**
 * Parses expressions in a value
 *
 * @param {String} value
 * @returns {Array}
 * @api private
 */

function getFunctionCalls(call, functionIdentifier) {
  var expressions = []

  var fnRE = typeof functionIdentifier === "string" ? new RegExp("\\b(" + functionIdentifier + ")\\(") : functionIdentifier
  do {
    var searchMatch = fnRE.exec(call)
    if (!searchMatch) {
      return expressions
    }
    if (searchMatch[1] === undefined) {
      throw new Error("Missing the first couple of parenthesis to get the function identifier in " + functionIdentifier)
    }
    var fn = searchMatch[1]
    var startIndex = searchMatch.index
    var matches = balanced("(", ")", call.substring(startIndex))

    if (!matches) {
      throw new SyntaxError(functionIdentifier + "(): missing closing ')' in the value '" + call + "'")
    }

    expressions.push({matches: matches, functionIdentifier: fn})
    call = matches.post
  }
  while (fnRE.test(call))

  return expressions
}

/**
 * Evaluates an expression
 *
 * @param {String} expression
 * @returns {String}
 * @api private
 */

function evalFunctionCall (string, functionIdentifier, callback, call) {
  // allow recursivity
  return callback(reduceFunctionCall(string, functionIdentifier, callback), functionIdentifier, call)
}
