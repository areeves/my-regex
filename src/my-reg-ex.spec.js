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

    describe('Pattern (foo|bar)*', () => {
      before(() => regex = new MyRegEx('(foo|bar)*'))

      it('should match empty string', () => {
        expect(regex.test('')).to.be.true
      })

      it('should match `foo`', () => {
        expect(regex.test('foo')).to.be.true
      })

      it('should match `bar`', () => {
        expect(regex.test('bar')).to.be.true
      })

      it('should match `foofoo`', () => {
        expect(regex.test('foofoo')).to.be.true
      })

      it('should match `barbar`', () => {
        expect(regex.test('barbar')).to.be.true
      })
    })

    describe('Pattern (foo|bar|baz)*', () => {
      before(() => regex = new MyRegEx('(foo|bar|baz)*'))

      it('should match `foo`', () => {
        expect(regex.test('foo')).to.be.true
      })

      it('should match `baz`', () => {
        expect(regex.test('baz')).to.be.true
      })

      it('should match `bazfoo`', () => {
        expect(regex.test('bazfoo')).to.be.true
      })
    })
  })
})
