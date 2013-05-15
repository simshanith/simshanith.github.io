# Framework Deps

mocha       = require 'mocha'
should      = require 'should'
sinon		= require 'sinon'


gruntInit = ->
	grunt = require 'grunt'
	gruntfile	= require '../../gruntfile.js'
	gruntfile grunt
	return grunt

describe 'Gruntfile', ->

	grunt = null

	beforeEach ->
		grunt = gruntInit()

	it 'reads package.json', ->
		(grunt.config 'meta.name').should.equal 'simshanith.github.io'



describe 'Jade Locals Module', ->
	
	jade_locals = require '../../src/markup/helpers/scripts/jade_locals.js'
	grunt = null

	# Get a fresh instance of Grunt for each test.
	beforeEach ->
		grunt = gruntInit()

	it 'is a function', ->
		jade_locals.should.be.an.instanceOf Function

	it 'takes a reference to grunt', ->
		(jade_locals grunt).should.be.ok

	describe 'returns a locals object', ->

		locals = null
		
		before ->
			locals = jade_locals grunt

		it 'that exists', ->
			locals.should.be.an.instanceOf Object

		it 'that exposes an includeJs function', ->
			locals.includeJs.should.be.an.instanceOf Function

		describe 'which exposes includeJs', ->

			beforeEach ->
				sinon.stub grunt.log, 'error'
				sinon.spy locals, 'includeJs'

			afterEach ->
				locals.includeJs.restore()
				grunt.log.error.restore()

			it 'that logs an error when called without a name', ->
				locals.includeJs()
				grunt.log.error.called.should.be.ok

			it 'that returns undefined when called without a name', ->
				locals.includeJs()
				locals.includeJs.returned(sinon.match.same undefined).should.be.ok

			it 'that wraps a Javascript file when found by name', ->
				html = locals.includeJs 'yepnope'
				html.should.include '<script type="text/javascript">'
				html.should.include '</script>'

			it 'that throws an error when Javascript file is not found by name', ->
				missingFile = ->
					html = locals.includeJs 'what'	
				missingFile.should.throw

			it 'that looks up different files based on grunt `build` config', ->
				name = 'yepnope'
				htmlProd = locals.includeJs name
				grunt.config 'build', 'dev'
				htmlDev = locals.includeJs name
				htmlProd.should.not.equal htmlDev
				htmlDev.should.include '<script type="text/javascript">'
				htmlDev.should.include '</script>'
				htmlProd.should.include '<script type="text/javascript">'
				htmlProd.should.include '</script>'