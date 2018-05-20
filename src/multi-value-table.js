'use strict'

/**
 * Class representing a table of columns and rows where each row-column pair can have multiple values
 */
class MultiValueTable {
  constructor () {
    /*
     * @property {Map< Map< Set<?> > >} row -> column -> values
     */
    this.data = new Map()
  }

  /**
   * @property {Set<?>} Set of row labels in the table
   */
  get rowLabels () {
    return new Set(Array.from(this.data.keys()))
  }

  /**
   * @property {Set<?>} Set of column labels in the table
   */
  get columnLabels () {
    const cls = new Set()
    for (let colMap of this.data.values()) {
      for (let colLabel of colMap.keys()) {
        cls.add(colLabel)
      }
    }
    return cls
  }

  /**
   * Add a value to the table
   * @param {any} row Label of row in which to add the value
   * @param {any} column Label of column in which to add the value
   * @param {any} value Value to add
   */
  addValue (row, column, value) {
    if (!this.data.has(row)) {
      this.data.set(row, new Map())
    }
    if (!this.data.get(row).has(column)) {
      this.data.get(row).set(column, new Set())
    }
    this.data.get(row).get(column).add(value)
    return this
  }

  /**
   * Get values from a row-column in the table
   * @param {any} row Label of the row
   * @param {any} column Label of the column
   * @return {Set} Copy of the set of values
   */
  getValues (row, column) {
    if (!this.data.has(row) || !this.data.get(row).has(column)) {
      return new Set()
    }
    return new Set(this.data.get(row).get(column))
  }
}

module.exports = MultiValueTable
