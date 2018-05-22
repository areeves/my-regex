/**
 * Compile parsed patterns into FSMs
 */
class Compiler {
  /**
   * Constructor
   * @param {class}  Inject FSM class dependency
   */
  constructor (FSM) {
    this.FSM = FSM
  }

  /**
   * Compile parse tree
   * @param {object|string} node Node or string literal from the parser
   * @returns {object}
   */
  compile (node) {
    // string node
    if (typeof node === 'string') {
      return this.FSM.fromString(node)
    }

    // concat node
    if (Array.isArray(node.concat) && node.concat.length) {
      let elems = node.concat.slice()
      let res = this.compile(elems.shift())
      while (elems.length) {
        res = this.FSM.concat(
          res,
          this.compile(elems.shift())
        )
      }
      return res
    }

    // union node
    if (Array.isArray(node.union) && node.union.length) {
      let elems = node.union.slice()
      let res = this.compile(elems.shift())
      while (elems.length) {
        res = this.FSM.union(
          res,
          this.compile(elems.shift())
        )
      }
      return res
    }

    // star node
    if (node.star) {
      return this.FSM.star(this.compile(node.star))
    }

    // unrecognized node
    throw new Error('Unrecognized node structure' + JSON.stringify(node, null, 2))
  }
}

module.exports = Compiler
