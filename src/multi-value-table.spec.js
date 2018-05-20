const expect = require('chai').expect

const MultiValueTable = require('./multi-value-table')

describe('The MultiValueTable class', () => {
  it('should be constructed without parameters', () => {
    const mvt = new MultiValueTable()
    expect(mvt).to.be.an.instanceof(MultiValueTable)
  })

  describe('addValue() method', () => {
    it('should return "this"', () => {
      let t = new MultiValueTable()
      let r = t.addValue(1, 3, 4)
      expect(r).to.equal(t)
    })

    it('should set value which can be got with getValue()', () => {
      let t = new MultiValueTable()
      t.addValue(1, 2, 3)
      let r = t.getValues(1, 2)
      expect(Array.from(r)).to.have.members([3])
    })

    it('should set multiple values', () => {
      let t = new MultiValueTable()
      t.addValue(1, 2, 3)
      t.addValue(1, 2, 4)
      let r = t.getValues(1, 2)
      expect(Array.from(r)).to.have.members([3, 4])
    })
  })

  describe('getValues() method', () => {
    it('should return object of type Set', () => {
      let t = new MultiValueTable()
      let r = t.getValues(1, 2)
      expect(r).to.be.instanceof(Set)
    })

    it('should return an empty set when table does not have row', () => {
      let t = new MultiValueTable()
      t.addValue(1, 2, 3)
      let r = t.getValues(4, 2)
      expect(Array.from(r)).to.have.members([])
    })

    it('should return an empty set when table does not have column', () => {
      let t = new MultiValueTable()
      t.addValue(1, 2, 3)
      let r = t.getValues(1, 4)
      expect(Array.from(r)).to.have.members([])
    })
  })

  describe('get rowLabels() getter', () => {
    it('should return a Set', () => {
      let t = new MultiValueTable()
      expect(t.rowLabels).to.be.instanceof(Set)
    })

    it('should return the labels of rows for added values', () => {
      let t = new MultiValueTable()
      t.addValue(1, 2, 3)
      t.addValue(4, 5, 6)
      expect(Array.from(t.rowLabels)).to.have.members([1, 4])
    })
  })

  describe('get columnLabels() getter', () => {
    it('should return a Set', () => {
      let t = new MultiValueTable()
      expect(t.columnLabels).to.be.instanceof(Set)
    })

    it('should return the labels of rows for added values', () => {
      let t = new MultiValueTable()
      t.addValue(1, 2, 3)
      t.addValue(4, 5, 6)
      expect(Array.from(t.columnLabels)).to.have.members([2, 5])
    })
  })
})
