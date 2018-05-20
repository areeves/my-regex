/**
 * Parse pattern strings
 */
class Parser {
  /**
   * Parse input string
   *
   * Returns a simple object:
   *  {
   *    type: concat|union
   *    params: [ (string|object), ... ]
   *  }
   * where the child objects have the same structure
   *
   * Example: foo(bar|baz)wakka
   * Yields: { type: concat, params: [ 'foo', { type: union, params: [ 'bar', 'baz'] }, 'wakka'] }
   *
   * @param {string} input Pattern to parse
   * @returns {object}
   */
  parse (input) {
    this.input = input
    this.rest = Array.from(input)
    return this._parse()
  }

  /**
   * Internal recursive function
   * @private
   */
  _parse (input) {
    let str = ''
    let cct = []

    while (this.rest.length) {
      let next = this.rest.shift()
      if (next == ')') {
        break
      } else if (next == '(') {
        if (str.length) {
          cct.push(str)
          str = ''
        }
        let inner = this._parse()
        if (Array.isArray(inner.concat)) {
          cct = cct.concat(inner.concat)
        } else {
          cct.push(inner)
        }
      } else if (next == '|') {
        if (str.length) {
          cct.push(str)
          str = ''
        }
        if (cct.length == 1) {
          cct = [ {union: [cct[0], this._parse()]} ]
        } else {
          cct = [ {union: [ {concat: cct}, this._parse()]} ]
        }
      } else {
        str += next
      }
    }

    if (str.length) {
      cct.push(str)
    }
    if (cct.length == 1) {
      return cct[0]
    }
    return {concat: cct}
  }
}

module.exports = Parser
