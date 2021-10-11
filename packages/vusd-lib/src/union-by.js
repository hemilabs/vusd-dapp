'use strict'

const identity = x => x
const first = (...args) => args[0]

// Given two or more arrays, generates a new array with the union of all the
// elements. Uniqueness is computed using the `iteratee` function. Duplicates are
// created using the `criteria` function.
const unionBy = function (arrays, iteratee = identity, criteria = first) {
  const ids = {}
  const all = [].concat(arrays)
  all.forEach(function (element) {
    const id = iteratee(element)
    const previous = ids[id]
    ids[id] = previous ? criteria(previous, element) : element
  })
  return Object.values(ids)
}

module.exports = unionBy
