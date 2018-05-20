/**
 * Class representing a finite state machine
 * This is the storage and manipulation of states and transitions, the actual execution will be handled elsewhere.
 */
class FSM {

  constructor() {
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
  get states() {
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
  get symbols() {
    return new Set(
      // second element is our symbol
      this.delta.map( trans => trans[1] )
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
  get nextState() {
    let states = Array.from( this.states )
    states = states.filter( Number.isFinite )
    states.push(0)
    return Math.max.apply( null, states) + 1
  }

  /**
   * Add a transition
   * @param {number|string|symbol} from Originating state of the transition
   * @param {number|string|symbol} symbol Symbol on which the transition is valid
   * @param {number|string|symbol} to Destination state of the transition
   */
  add(from, symbol, to) {
    this.delta.push([from, symbol, to])
  }

  /**
   * Derive a new FSM containing only deltas in this FSM which start from a particular state
   *  @param {number|string|symbol} from The 'from' state
   *  @return {FSM}
   */
  from( from ){
    let fsm = new FSM()
    for ( let delta of this.delta ) {
      if ( delta[0] == from ) {
        fsm.add( delta[0], delta[1], delta[2])
      }
    }
    return fsm
  }

  /**
   * Derive a new FSM containing only deltas in this FSM which result in a particular state
   *  @param {number|string|symbol} to The 'to' state
   *  @return {FSM}
   */
  to( to ){
    let fsm = new FSM()
    for ( let delta of this.delta ) {
      if ( delta[2] == to ) {
        fsm.add( delta[0], delta[1], delta[2])
      }
    }
    return fsm
  }

  /**
   * Create a FSM from a string, treating each character as a symbol.
   * @param {string} input The input string
   * @return {FSM}
   */
  static fromString( input ) {
    const fsm = new FSM()
    let state = fsm.startState = 1
    for (let c of input ) {
      fsm.add(state, c, ++state)
    }
    fsm.finalStates.add( state )
    return fsm
  }

  /**
   * Create a FSM which is the union of two FSMs
   * @param {FSM} fsm1 First FSM
   * @param {FSM} fsm2 Second FSM
   * @return {FSM}
   * @throws {Error} If either FSM is missing starting or final states
   */
  static union(fsm1, fsm2) {
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
    fsm1.delta.forEach( d => result.add( d[0], d[1], d[2] ) )
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
      result.add( stateMap.get(d[0]), d[1], stateMap.get(d[2]) )
    }

    // add mapped final states from fsm2
    for( let state of fsm2.finalStates) {
      result.finalStates.add( stateMap.get(state) )
    }

    return result
  }
}

module.exports = FSM
