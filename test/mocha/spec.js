(function() {
  var jade_locals, mocha, should;

  mocha = require('mocha');

  should = require('should');

  jade_locals = require('../../src/markup/helpers/scripts/jade_locals.js');

  describe('Jade Locals Module', function() {
    return it('should return a function', function() {
      return jade_locals.should.be.an.instanceOf(Function);
    });
  });

}).call(this);
