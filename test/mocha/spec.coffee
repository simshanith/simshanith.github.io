mocha       = require 'mocha'
should      = require 'should'
sinon		= require 'sinon'
grunt		= require 'grunt'
gruntfile	= require '../../gruntfile.js'
jade_locals = require '../../src/markup/helpers/scripts/jade_locals.js'

gruntfile grunt

describe 'Gruntfile', ->

	it 'reads package.json', ->
		(grunt.config 'meta.name').should.equal 'simshanith.github.io'



describe 'Jade Locals Module', ->

	it 'is a function', ->
		jade_locals.should.be.an.instanceOf Function

	it 'takes a reference to grunt', ->
		(jade_locals grunt).should.be.ok

	describe 'returns a locals object', ->

		locals = null
		
		before ->
			grunt		= require 'grunt'
			gruntfile	= require '../../gruntfile.js'
			gruntfile grunt
			locals = jade_locals grunt

		it 'that exists', ->
			locals.should.be.an.instanceOf Object

		it 'that exposes an includeJs function', ->
			locals.includeJs.should.be.an.instanceOf Function

		describe 'exposes includeJs', ->

			it 'logs an error when called without a name', ->
				sinon.stub grunt.log, 'error'
				locals.includeJs()
				grunt.log.error.called.should.be.ok

			it 'returns undefined when called without a name', ->
				sinon.spy locals, "includeJs"
				locals.includeJs()
				locals.includeJs.returned(sinon.match.same undefined).should.be.ok

			it 'wraps a Javascript file when found by name', ->
				html = locals.includeJs 'yepnope'
				html.should.include '<script type="text/javascript">'
				html.should.include '</script>'

			it 'looks up different files based on grunt `build` config', ->
				htmlProd = locals.includeJs 'yepnope'
				grunt.config 'build', 'dev'
				htmlDev = locals.includeJs 'yepnope'
				htmlProd.should.not.equal htmlDev
				htmlDev.should.include '<script type="text/javascript">'
				htmlDev.should.include '</script>'
				htmlProd.should.include '<script type="text/javascript">'
				htmlProd.should.include '</script>'