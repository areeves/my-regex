const expect = require('chai').expect

const Compiler = require('./compiler')
const FSM = require('./fsm')

/*
 * These are mostly integration tests insteae of unit tests.
 * @todo Use injection to spy/stub/mock to get rid of the dependence on the FSM class
 */
describe('The Compiler class', () => {
  it('should be constructed with FSM dependency', () => {
    let compiler = new Compiler(FSM)
    expect(compiler).to.be.instanceof(Compiler)
  })

  describe('The compile() method', () => {
    it('should be able to compile a string', () => {
      let compiler = new Compiler(FSM)
      let target = new FSM()
      target.add(1, 'f', 2)
      target.add(2, 'o', 3)
      target.add(3, 'o', 4)
      target.startState = 1
      target.finalStates.add(4)
      let result = compiler.compile('foo')
      expect(result).to.deep.equal(target)
    })

    it('should be able to compile a concat node of three strings', () => {
      let compiler = new Compiler(FSM)
      let target = new FSM()
      target.add(1, 'f', 2)
      target.add(2, 'o', 3)
      target.add(3, 'o', 4)
      target.add(4, 'b', 5)
      target.add(5, 'a', 6)
      target.add(6, 'r', 7)
      target.add(7, 'b', 8)
      target.add(8, 'a', 9)
      target.add(9, 'z', 10)
      target.startState = 1
      target.finalStates.add(10)
      let result = compiler.compile({ concat: ['foo', 'bar', 'baz' ] })
      expect(result).to.deep.equal(target)
    })

    it('should be able to compile a union node of three strings', () => {
      let compiler = new Compiler(FSM)
      let target = new FSM()
      target.add(1, 'f', 2)
      target.add(2, 'o', 3)
      target.add(3, 'o', 4)
      target.add(1, 'b', 5)
      target.add(5, 'a', 6)
      target.add(6, 'r', 7)
      target.add(1, 'b', 8)
      target.add(8, 'a', 9)
      target.add(9, 'z', 10)
      target.startState = 1
      target.finalStates.add(4).add(7).add(10)
      let result = compiler.compile({ union: ['foo', 'bar', 'baz' ] })
      expect(result).to.deep.equal(target)
    })

    it('should be able to compile a star node of a string ', () => {
      let compiler = new Compiler(FSM)
      let target = FSM.star(FSM.fromString('x'))
      let result = compiler.compile({star: 'x'})
      expect(Array.from(result.finalStates)).to.deep.equal(Array.from(target.finalStates))
      expect(result).to.deep.equal(target)
    })
  })
})
