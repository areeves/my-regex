const Parser = require('./parser')
const Compiler = require('./compiler')
const FSM = require('./fsm')

class MyRegEx {
  /**
   * Constructor
   * @param {string} pattern Regex pattern to match
   */
  constructor (pattern) {
    this.pattern = pattern
    this.parser = new Parser()
    this.compiler = new Compiler(FSM)
    this.parserTree = null
    this.fsm = null

    this.parseTree = this.parser.parse(this.pattern)

    this.fsm = this.compiler.compile(this.parseTree)
    this.fsm.removeEpsilons()
  }

  /**
   * Test a string against the pattern
   * @param {string} input String to test
   * @returns {boolean}
   */
  test (input) {
    // initialize the current state to the start state
    let currentStates = new Set([this.fsm.startState])

    // transition through the input string
    for (let symbol of input) {
      currentStates = this.fsm.fromOn(currentStates, symbol)
      // early out
      if (currentStates.size == 0) {
        return false
      }
    }

    // check for a final state
    for (let s of currentStates) {
      if (this.fsm.finalStates.has(s)) {
        return true
      }
    }
    // no intersection of currentStates and finalStates, no match
    return false
  }
}

module.exports = MyRegEx
