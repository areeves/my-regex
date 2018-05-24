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
  _parse () {
    let str = ''
    let cct = [] // concatenation
    let alt = [] // alternation

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
        cct.push(inner)
      } else if (next == '|') {
        if (str.length) {
          cct.push(str)
          str = ''
        }
        if (cct.length == 1) {
          alt.push(cct[0])
        } else {
          alt.push( {concat: cct} )
        }
        cct = []
      } else if (next == '*') {
        if (str.length) {
          cct.push(str)
          str = ''
        }
        let child = cct.pop()
        child = {star: child}
        cct.push(child)
      } else {
        str += next
      }
    }

    if (str.length) {
      cct.push(str)
    }
    if (cct.length == 1) {
      alt.push(cct[0])
    } else {
      alt.push( { concat: cct } )
    }
    if (alt.length == 1) {
      return alt[0]
    } else {
      return { union: alt } 
    }
  }
}

module.exports = Parser
