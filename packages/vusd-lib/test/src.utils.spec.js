'use strict'

require('chai').should()

const { fromUnit, toUnit } = require('../src/utils')

describe('Utils', function () {
  it('should convert from unit', function () {
    fromUnit('1000000000000000000').should.equal('1')
    fromUnit('1000000000000000000', 6).should.equal('1000000000000')
    fromUnit('1000000', 6).should.equal('1')
    fromUnit('1000', 3).should.equal('1')
    fromUnit('1000', 2).should.equal('10')
    fromUnit('1500000000000000000').should.equal('1.5')
    fromUnit('500000', 6).should.equal('0.5')
  })

  it('should convert to unit', function () {
    toUnit('1').should.equal('1000000000000000000')
    toUnit('1', 6).should.equal('1000000')
    toUnit('1', 3).should.equal('1000')
    toUnit('10', 2).should.equal('1000')
    toUnit('1.5').should.equal('1500000000000000000')
    toUnit('0.5', 6).should.equal('500000')
  })
})
