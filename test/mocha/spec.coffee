# Framework Deps
mocha       = require 'mocha'
should      = require 'should'
sinon       = require 'sinon'

require 'mocha-sinon'

# Grunt Setup, modelled off of `mocha-sinon` plugin
## Gives fresh instance of grunt config for each test.
grunt = null

gruntInit = ->
	grunt = require 'grunt'
	gruntfile   = require '../../gruntfile.js'
	gruntfile grunt
	return grunt

beforeEach ->
	grunt = gruntInit()

# Gruntfile Suite.
## Currently just checks basic templating and file io capabilities.

describe 'Gruntfile', ->

	it 'reads package.json', ->
		should.equal 'simshanith.github.io', grunt.config('meta.name')

# Jade Locals suite.
## Checks that Jade helper functions work as expected.

describe 'Jade Locals Module', ->

	#### Get a shared instance of the jade locals object.
	#### Pass a reference to grunt into the module.

	jade_locals = require '../../src/markup/helpers/scripts/jade_locals.js'
	localsObj = null

	before ->
		localsObj = jade_locals grunt

	it 'is a function', ->
		jade_locals.should.be.an.instanceOf Function

	it 'returns a locals object', ->
		localsObj.should.be.an.instanceOf Object

	it 'exposes an includeJs function', ->
		localsObj.includeJs.should.be.an.instanceOf Function

	describe 'provides `includeJs` helper function', ->

		#### Define some expectations.
		startTag	= '<script type="text/javascript">'
		endTag		=	'</script>'

		#### Stub `grunt.log.error` to suppress intentonal warnings.
		beforeEach ->
			sinon.stub grunt.log, 'error'

		#### Teardown sinon stub.
		afterEach ->
			grunt.log.error.restore()

		#### Error / fail task when trying to include missing file.
		it 'that throws an error when Javascript file is not found by name', ->
			missingFile = ->
				html = localsObj.includeJs 'what'
			missingFile.should.throw

		#### Error but continue compiling when including nothing.
		it 'that logs an error when called without a name', ->
			localsObj.includeJs()
			grunt.log.error.called.should.be.true

		it 'that returns undefined when called without a name', ->
			should.strictEqual undefined, localsObj.includeJs()

		#### Jade `include` should handle this automagically with `.js` extension...
		it 'that wraps a Javascript file when found by name', ->
			html 			= localsObj.includeJs 'yepnope'
			htmlStart = html.slice 0, startTag.length
			htmlEnd		= html.slice -1 * endTag.length

			htmlStart.should.equal startTag
			htmlEnd.should.equal endTag

		#### ...but Jade `include` cannot handle variables, so this is a bonus.
		it 'that looks up different files based on grunt `build` config', ->
			name = 'yepnope'
			
			htmlProd = localsObj.includeJs name
			grunt.config 'build', 'dev'
			htmlDev = localsObj.includeJs name

			htmlProd.should.not.equal htmlDev

			htmlDev.should.include startTag
			htmlProd.should.include startTag