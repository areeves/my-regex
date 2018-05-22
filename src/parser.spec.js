const expect = require('chai').expect

const Parser = require('./parser')

describe('The Parser class', () => {
  it('should be constructed without parameters', () => {
    let parser = new Parser()
    expect(parser).to.be.instanceof(Parser)
  })

  describe('The parse() method', () => {
    it('should be able to parse "foo(bar|baz)wakka"', () => {
      let parser = new Parser()
      let target = {
        concat: [
          'foo',
          { union: ['bar', 'baz'] },
          'wakka'
        ]
      }
      let result = parser.parse('foo(bar|baz)wakka')
      expect(result).to.deep.equal(target)
    })

    it('should be able to parse "foo|(bar|baz)wakka"', () => {
      let parser = new Parser()
      let target = {
        union: [
          'foo',
          { concat: [
            { union: ['bar', 'baz'] },
            'wakka'
          ] }
        ]
      }
      let result = parser.parse('foo|(bar|baz)wakka')
      expect(result).to.deep.equal(target)
    })

    it('should be able to parse "(foo)"', () => {
      let parser = new Parser()
      let target = 'foo'
      let result = parser.parse('(foo)')
      expect(result).to.deep.equal(target)
    })

    it('should be able to parse "(foo|bar)|baz"', () => {
      let parser = new Parser()
      let target = {
        union: [
          { union: [ 'foo', 'bar' ] },
          'baz'
        ]
      }
      let result = parser.parse('(foo|bar)|baz')
      expect(result).to.deep.equal(target)
    })

    it('should be able to parse "(foo|bar)baz|wakka"', () => {
      let parser = new Parser()
      let target = {
        union: [
          {
            concat: [
              { union: [ 'foo', 'bar' ] },
              'baz'
            ]
          },
          'wakka'
        ]
      }
      let result = parser.parse('(foo|bar)baz|wakka')
      expect(result).to.deep.equal(target)
    })

    it('should be able to parse `foo*`', () => {
      let parser = new Parser()
      let target = { star: 'foo' }
      let result = parser.parse('foo*')
      expect(result).to.deep.equal(target)
    })

    it('should be able to parse `(foo|bar)*`', () => {
      let parser = new Parser()
      let target = { star: { union: ['foo', 'bar'] } }
      let result = parser.parse('(foo|bar)*')
      expect(result).to.deep.equal(target)
    })
  })
})
