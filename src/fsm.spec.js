const expect = require('chai').expect

const FSM = require('./fsm')

describe('The FSM class', () => {
  it('should be constructed without parameters', () => {
    let fsm = new FSM()
    expect(fsm).to.be.instanceof(FSM)
  })

  describe('The states property', () => {
    it('should be initialized to an empty set', () => {
      let fsm = new FSM()
      expect(fsm.states).to.be.instanceof(Set)
      expect(fsm.states.size).is.equal(0)
    })

    it('should reflect states added', () => {
      let fsm = new FSM()
      fsm.add(1, 'a', 2)
      expect(Array.from(fsm.states)).to.have.members([1, 2])
    })
  })

  describe('The symbols property', () => {
    it('should be initialized to an empty set', () => {
      let fsm = new FSM()
      expect(fsm.symbols).to.be.instanceof(Set)
      expect(fsm.symbols.size).is.equal(0)
    })

    it('should reflect symbols added', () => {
      let fsm = new FSM()
      fsm.add(1, 'a', 2)
      expect(Array.from(fsm.symbols)).to.have.members(['a'])
      fsm.add(1, 'b', 2)
      expect(Array.from(fsm.symbols)).to.have.members(['a', 'b'])
    })
  })

  describe('The nextState property', () => {
    it('should be equal to 1 + the largest integer state label', () => {
      let fsm = new FSM()
      fsm.add(3, 'a', 5)
      expect(fsm.nextState).to.equal(6)
    })

    it('should evaluate to the same value on back-to-back references', () => {
      let fsm = new FSM()
      fsm.add(3, 'a', 5)
      let ref1 = fsm.nextState
      let ref2 = fsm.nextState
      expect(ref2).to.equal(ref1)
    })
  })

  describe('The from() method', () => {
    it('should return an FSM containing only the states and symbols from deltas with the particular starting state', () => {
      let fsm = new FSM()
      fsm.add(1, 'a', 2)
      fsm.add(1, 'b', 3)
      fsm.add(4, 'c', 5)
      let from1 = fsm.from(1),
        from1states = Array.from(from1.states),
        from1symbols = Array.from(from1.symbols)
      expect(from1states).to.have.members([1, 2, 3])
      expect(from1symbols).to.have.members(['a', 'b'])
      let from2 = fsm.from(2),
        from2states = Array.from(from2.states),
        from2symbols = Array.from(from2.symbols)
      expect(from2states).to.have.members([])
      expect(from2symbols).to.have.members([])
      let from4 = fsm.from(4),
        from4states = Array.from(from4.states),
        from4symbols = Array.from(from4.symbols)
      expect(from4states).to.have.members([4, 5])
      expect(from4symbols).to.have.members(['c'])
    })
  })

  describe('The to() method', () => {
    it('should return an FSM containing only the states and symbols from deltas with the particular resulting state', () => {
      let fsm = new FSM()
      fsm.add(2, 'a', 1)
      fsm.add(3, 'b', 1)
      fsm.add(5, 'c', 4)
      let to1 = fsm.to(1),
        to1states = Array.from(to1.states),
        to1symbols = Array.from(to1.symbols)
      expect(to1states).to.have.members([1, 2, 3])
      expect(to1symbols).to.have.members(['a', 'b'])
      let to2 = fsm.to(2),
        to2states = Array.from(to2.states),
        to2symbols = Array.from(to2.symbols)
      expect(to2states).to.have.members([])
      expect(to2symbols).to.have.members([])
      let to4 = fsm.to(4),
        to4states = Array.from(to4.states),
        to4symbols = Array.from(to4.symbols)
      expect(to4states).to.have.members([4, 5])
      expect(to4symbols).to.have.members(['c'])
    })
  })

  describe('The fromString() method', () => {
    it('should return an FSM for the provided string', () => {
      let target = new FSM()
      target.startState = 1
      target.add(1, 'b', 2)
      target.add(2, 'a', 3)
      target.add(3, 'r', 4)
      target.finalStates.add(4)
      expect(FSM.fromString('bar')).to.deep.equal(target)
    })
  })

  describe('The union() method', () => {
    it('should return an FSM which is the union of the two parameters', () => {
      const target = new FSM()
      target.startState = 1
      target.add(1, 'f', 2)
      target.add(2, 'o', 3)
      target.add(3, 'o', 4)
      target.finalStates.add(4)
      target.add(1, 'b', 5)
      target.add(5, 'a', 6)
      target.add(6, 'r', 7)
      target.finalStates.add(7)
      expect(FSM.union(FSM.fromString('foo'), FSM.fromString('bar'))).to.deep.equal(target)
    })
  })

  describe('The star() method', () => {
    it('should return an FSM which is the star construction of `x`', () => {
      const target = new FSM()
      target.startState = 3
      target.add(1, 'x', 2)
      target.add(3, FSM.EPSILON, 1)
      target.add(2, FSM.EPSILON, 4)
      target.add(3, FSM.EPSILON, 4)
      target.add(2, FSM.EPSILON, 1)
      target.finalStates.add(4)
      const result = FSM.star(FSM.fromString('x'))
      expect(Array.from(result.finalStates)).to.have.members(Array.from(target.finalStates))
      expect(result).to.deep.equal(target)
    })

    it('should return an FSM which is the star construction of `x|y`', () => {
      const target = new FSM()
      target.startState = 5
      target.add(1, 'x', 2)
      target.add(1, 'y', 3)
      target.add(2, FSM.EPSILON, 4)
      target.add(3, FSM.EPSILON, 4)
      target.add(5, FSM.EPSILON, 1)
      target.add(4, FSM.EPSILON, 6)
      target.add(5, FSM.EPSILON, 6)
      target.add(4, FSM.EPSILON, 1)
      target.finalStates.add(6)
      const result = FSM.star(FSM.union(FSM.fromString('x'), FSM.fromString('y')))
      expect(Array.from(result.finalStates)).to.have.members(Array.from(target.finalStates))
      expect(result).to.deep.equal(target)
    })
  })

  describe('The concat() static method', () => {
    it('should concatenate two simple strings', () => {
      const target = new FSM()
      target.startState = 1
      target.add(1, 'f', 2)
      target.add(2, 'o', 3)
      target.add(3, 'o', 4)
      target.add(4, 'b', 5)
      target.add(5, 'a', 6)
      target.add(6, 'r', 7)
      target.finalStates.add(7)
      expect(
        FSM.concat(
          FSM.fromString('foo'),
          FSM.fromString('bar')
        )
      ).to.deep.equal(target)
    })

    it('should concatenate the union of two simple strings with a third', () => {
      const target = new FSM()
      target.startState = 1
      target.add(1, 'f', 2)
      target.add(2, 'o', 3)
      target.add(3, 'o', 4)
      target.add(1, 'b', 5)
      target.add(5, 'a', 6)
      target.add(6, 'r', 7)
      target.add(4, FSM.EPSILON, 8)
      target.add(7, FSM.EPSILON, 8)
      target.add(8, 'b', 9)
      target.add(9, 'a', 10)
      target.add(10, 'z', 11)
      target.finalStates.add(11)
      expect(
        FSM.concat(
          FSM.union(
            FSM.fromString('foo'),
            FSM.fromString('bar')
          ),
          FSM.fromString('baz')
        )
      ).to.deep.equal(target)
    })
  })

  describe('The fromOn() method', () => {
    it('should handle multiple from and to states', () => {
      let fsm = new FSM()
      fsm.add(1, 'a', 2)
      fsm.add(1, 'a', 3)
      fsm.add(3, 'a', 4)
      fsm.add(4, 'a', 5)
      fsm.add(4, 'a', 6)
      fsm.add(1, 'b', 7)
      fsm.add(4, 'b', 8)
      let target = [2, 3, 5, 6]
      let result = fsm.fromOn([1, 4], 'a')
      expect(Array.from(result)).to.have.members(target)
    })
  })

  describe('The epsilonClosure() method', () => {
    it('should traverse multiple epsilons', () => {
      let fsm = new FSM()
      fsm.add(1, FSM.EPSILON, 2)
      fsm.add(2, FSM.EPSILON, 3)
      fsm.add(2, FSM.EPSILON, 4)
      fsm.add(4, 'x', 5)
      fsm.add(5, 'x', 6)
      let result = fsm.epsilonClosure([1, 5])
      let target = [1, 2, 3, 4, 5]
      expect(Array.from(result)).to.have.members(target)
    })
  })

  describe('The removeEpsilons() method', () => {
    it('should remove epsilons before and after transition', () => {
      let fsm = new FSM()
      fsm.add(1, FSM.EPSILON, 2)
      fsm.add(2, 'x', 3)
      fsm.add(3, FSM.EPSILON, 4)
      fsm.finalStates.add(4)
      fsm.removeEpsilons()
      let target = new FSM()
      target.add(2, 'x', 3)
      target.add(1, 'x', 3)
      target.add(1, 'x', 4)
      target.add(2, 'x', 4)
      target.finalStates.add(3).add(4)
      expect(Array.from(fsm.finalStates)).to.have.members(Array.from(target.finalStates))
      expect(fsm).to.deep.equal(target)
    })
  })
})
