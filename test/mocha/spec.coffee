mocha       = require 'mocha'
should      = require 'should'
jade_locals = require '../../src/markup/helpers/scripts/jade_locals.js'


describe 'Jade Locals Module', ->
	it 'should return a function', ->
		jade_locals.should.be.an.instanceOf Function