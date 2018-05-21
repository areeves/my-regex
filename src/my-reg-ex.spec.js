const expect = require('chai').expect

const MyRegEx = require('./my-reg-ex')

describe('The MyRegEx class', () => {
  describe('Integration tests', () => {
    let regex = null
    describe('Pattern foo(bar|baz)wakka', () => {
      before(() => regex = new MyRegEx('foo(bar|baz)wakka'))
      it('should match foobarwakka', () => {
        expect(regex.test('foobarwakka')).to.be.true
      })

      it('should match foobazwakka', () => {
        expect(regex.test('foobazwakka')).to.be.true
      })

      it('should NOT match foo', () => {
        expect(regex.test('foo')).to.be.false
      })

      it('should NOT match foowakka', () => {
        expect(regex.test('foowakka')).to.be.false
      })
    })
  })
})
