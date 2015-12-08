/*
 * Module dependencies
 */
var balanced = require("balanced-match")
var reduce = require("promise-reduce")

/**
 * Expose `reduceFunctionCall`
 *
 * @type {Function}
 */
module.exports = reduceFunctionCall

/**
 * Walkthrough all expressions, evaluate them and insert them into the declaration
 *
 * @param {string} declaration
 * @param {string|RegExp} filter
 * @param {function} callback
 * @returns {Promise}
 */
function reduceFunctionCall(declaration, filter, callback) {
  return getFunctionCalls(declaration, filter)
    .then(reduce(function(memo, expression) {
      return reduceFunctionCall(expression.matches.body, filter, callback)
        .then(function(result) {
          return callback(result, expression.functionIdentifier, declaration)
        })
        .then(function(result) {
          var pristineFunctionCall = expression.functionIdentifier + "(" + expression.matches.body + ")"
          return memo.replace(pristineFunctionCall, result)
        })
    }, declaration))
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
      return Promise.resolve(expressions)
    }
    if (searchMatch[1] === undefined) {
      return Promise.reject(new Error("Missing the first couple of parenthesis to get the function identifier in " + functionRE))
    }
    var fn = searchMatch[1]
    var startIndex = searchMatch.index
    var matches = balanced("(", ")", call.substring(startIndex))

    if (!matches || matches.start !== searchMatch[0].length - 1) {
      return Promise.reject(SyntaxError(fn + "(): missing closing ')' in the value '" + call + "'"))
    }

    expressions.push({matches: matches, functionIdentifier: fn})
    call = matches.post
  }
  while (fnRE.test(call))

  return Promise.resolve(expressions)
}
