/*
 * Class constants
 */
const _EPSILON = Symbol('ϵ')

/**
 * Class representing a finite state machine
 * This is the storage and manipulation of states and transitions, the actual execution will be handled elsewhere.
 */
class FSM {
  static get EPSILON () {
    return _EPSILON
  }

  constructor () {
    /**
     * The set of transitions, stored as [qi symbol qj] array triples
     *
     * @property {Array}
     * @private
     */
    this.delta = []

    /**
     * The start state of the FSM.  Initially null, as it has no states
     * @property {number|string|symbol}
     * @public
     */
    this.startState = null

    /**
     * Set of accept states for the FSM
     * @property {Set<number|string|symbol>}
     * @public
     */
    this.finalStates = new Set()
  }

  /**
   * Set of all states in the FSM
   * @property {Set}
   * @readonly
   */
  get states () {
    const s = new Set()
    for (let trans of this.delta) {
      // first and third elements are states
      s.add(trans[0]).add(trans[2])
    }
    return s
  }

  /**
   * Set of all symbols of the language
   * @property {Set}
   * @readonly
   */
  get symbols () {
    return new Set(
      // second element is our symbol
      this.delta.map(trans => trans[1])
    )
  }

  /**
   * Get next available integer state name
   * Does *not* use an incrementor, so referring to it twice without adding deltas with resolve to the same value:
   *  ```
   *  let a = t.nextState
   *  let b = t.nextState
   *  a == b // true
   *  ```
   * @property {integer}
   * @readonly
   */
  get nextState () {
    let states = Array.from(this.states)
    states = states.filter(Number.isFinite)
    states.push(0)
    return Math.max.apply(null, states) + 1
  }

  /**
   * Add a transition
   * @param {number|string|symbol} from Originating state of the transition
   * @param {number|string|symbol} symbol Symbol on which the transition is valid
   * @param {number|string|symbol} to Destination state of the transition
   */
  add (from, symbol, to) {
    this.delta.push([from, symbol, to])
  }

  /**
   * Derive a new FSM containing only deltas in this FSM which start from a particular state
   *  @param {number|string|symbol} from The 'from' state
   *  @return {FSM}
   */
  from (from) {
    let fsm = new FSM()
    for (let delta of this.delta) {
      if (delta[0] == from) {
        fsm.add(delta[0], delta[1], delta[2])
      }
    }
    return fsm
  }

  /**
   * Derive a new FSM containing only deltas in this FSM which result in a particular state
   *  @param {number|string|symbol} to The 'to' state
   *  @return {FSM}
   */
  to (to) {
    let fsm = new FSM()
    for (let delta of this.delta) {
      if (delta[2] == to) {
        fsm.add(delta[0], delta[1], delta[2])
      }
    }
    return fsm
  }

  /**
   * Create a FSM from a string, treating each character as a symbol.
   * @param {string} input The input string
   * @return {FSM}
   */
  static fromString (input) {
    const fsm = new FSM()
    let state = fsm.startState = 1
    for (let c of input) {
      fsm.add(state, c, ++state)
    }
    fsm.finalStates.add(state)
    return fsm
  }

  /**
   * Create a FSM which is the union of two FSMs
   * @param {FSM} fsm1 First FSM
   * @param {FSM} fsm2 Second FSM
   * @return {FSM}
   * @throws {Error} If either FSM is missing starting or final states
   */
  static union (fsm1, fsm2) {
    if (!(fsm1 instanceof FSM && fsm2 instanceof FSM)) {
      throw new Error('Arguments must be instances of FSM')
    }
    if (fsm1.startState == null) {
      throw new Error('First FSM missing startState')
    }
    if (fsm1.finalStates.size == 0) {
      throw new Error('First FSM must have at least one final state')
    }
    if (fsm2.startState == null) {
      throw new Error('Second FSM missing startState')
    }
    if (fsm2.finalStates.size == 0) {
      throw new Error('Second FSM must have at least one final state')
    }

    // clone fsm1 into a new FSM
    let result = new FSM()
    fsm1.delta.forEach(d => result.add(d[0], d[1], d[2]))
    result.startState = fsm1.startState
    result.finalStates = new Set(fsm1.finalStates)

    // map states from fsm2 to new states in result FSM
    let nextState = result.nextState
    let stateMap = new Map()
    for (let state of fsm2.states) {
      if (state == fsm2.startState) {
        stateMap.set(state, fsm1.startState)
      } else {
        stateMap.set(state, nextState++)
      }
    }

    // add the fsm2 deltas, mapping the states
    for (let d of fsm2.delta) {
      result.add(stateMap.get(d[0]), d[1], stateMap.get(d[2]))
    }

    // add mapped final states from fsm2
    for (let state of fsm2.finalStates) {
      result.finalStates.add(stateMap.get(state))
    }

    return result
  }

  /**
   * Concatenate two FSMs
   * @param {FSM} fsm1 First FSM
   * @param {FSM} fsm2 Second FSM
   * @returns {FSM}
   * @throws {Error} If either FSM is missing starting or final states
   */
  static concat (fsm1, fsm2) {
    if (!(fsm1 instanceof FSM && fsm2 instanceof FSM)) {
      throw new Error('Arguments must be instances of FSM')
    }
    if (fsm1.startState == null) {
      throw new Error('First FSM missing startState')
    }
    if (fsm1.finalStates.size == 0) {
      throw new Error('First FSM must have at least one final state')
    }
    if (fsm2.startState == null) {
      throw new Error('Second FSM missing startState')
    }
    if (fsm2.finalStates.size == 0) {
      throw new Error('Second FSM must have at least one final state')
    }

    // clone fsm1 into a new FSM
    let result = new FSM()
    fsm1.delta.forEach(d => result.add(d[0], d[1], d[2]))
    result.startState = fsm1.startState

    // if fsm1 has multiple final states, merge with epsilon
    let fsm1finalState
    if (fsm1.finalStates.size == 1) {
      fsm1finalState = fsm1.finalStates.values().next().value
    } else {
      fsm1finalState = result.nextState
      for (let state of fsm1.finalStates) {
        result.add(state, FSM.EPSILON, fsm1finalState)
      }
    }

    // add fsm states, mapping its startState to the final state of fsm1
    let nextState = result.nextState
    let stateMap = new Map()
    for (let state of fsm2.states) {
      if (state == fsm2.startState) {
        stateMap.set(state, fsm1finalState)
      } else {
        stateMap.set(state, nextState++)
      }
    }

    // add the fsm2 deltas, mapping the states
    for (let d of fsm2.delta) {
      result.add(stateMap.get(d[0]), d[1], stateMap.get(d[2]))
    }

    // add mapped final states from fsm2
    for (let state of fsm2.finalStates) {
      result.finalStates.add(stateMap.get(state))
    }

    return result
  }

  /**
   * Retrive a set of states reached from the proveded state(s) on the provided transition symbol
   * @param {Set|array|number|string|symbol} from Starting state or collection of states
   *  @param {number|string|symbol} on Transition symbol
   *  @return {Set}  Set of reached states
   */
  fromOn (from, on) {
    // ensure from is a Set
    if (Array.isArray(from)) {
      from = new Set(from)
    }
    if (!(from instanceof Set)) {
      from = new Set([from])
    }

    // filter transitions to those for the from state and the transition symbol
    // return only the end states
    let res = this.delta.filter(d => d[1] == on && from.has(d[0]))
      .map(d => d[2])

    // return as a set
    return new Set(res)
  }

  /**
   * Return the epsilon closure of a state or set of states
   * @param {Set|number|string|symbol} state State or set of states
   * @returns {Set} Set of states in the closure
   */
  epsilonClosure (state) {
    // convert to set
    if (Array.isArray(state)) {
      state = new Set(state)
    }
    if (!(state instanceof Set)) {
      state = new Set([state])
    }

    // the state set is our closure, since every state has an implied epsilon transition to itself
    // Search for new states while set continues to expand
    let prevSize = 0 // force at least one iteration
    while (prevSize != state.size) {
      prevSize = state.size
      // find the destination states  on epsilon and add them to the set
      this.fromOn(state, FSM.EPSILON)
        .forEach(s => state.add(s))
    }
    return state
  }

  /**
   * Combine epsilonClosure and fromOn
   * @param {Set|array|number|string|symbol} from From state
   * @param {number|string|symbol} on Transition symbol
   * @returns {Set}
   */
  epsilonClosureOn (from, on) {
    return this.epsilonClosure(
      this.fromOn(
        this.epsilonClosure(from),
        on
      )
    )
  }

  /**
   * Remove epsilons by adding equivelent transitions
   */
  removeEpsilons () {
    // add missing explicit transitions
    for (let state of this.states) {
      for (let sym of this.symbols) {
        let current = this.fromOn(state, sym)
        let add = this.epsilonClosureOn(state, sym)
        // remove existing transitions from the add group
        for (let s of current) {
          add.delete(s)
        }
        // add the rest as new transitions
        for (let s of add) {
          this.add(state, sym, s)
        }
      }
    }

    // add any missing states to the finalState set
    for (let s of this.states) {
      if (this.finalStates.has(s)) {
        continue
      }
      // if the epsilon closure contains a final state, then this is a final state
      let closure = this.epsilonClosure(s)
      for (let c of closure) {
        if (this.finalStates.has(c)) {
          this.finalStates.add(s)
        }
      }
    }

    // remove the epsilon transitions
    this.delta = this.delta.filter(d => d[1] != FSM.EPSILON)
  }
}

module.exports = FSM
