describe 'jQuery', ->

  it 'should be loaded', ->
  	
  	waitsFor ->
  		yepnope.COMPLETED || (window.jQuery && !window.yepnope.complete)
  	, "yepnope never completed", 10000

  	runs ->
    	expect(window.jQuery).toBeTruthy()

describe 'body', ->

  beforeEach ->
    if yepnope.complete
      spyOn yepnope, 'complete'

  it 'should be dark', ->

    waitsFor ->
      yepnope.COMPLETED || (window.jQuery && !window.yepnope.complete)
    , "yepnope never completed", 10000

    runs ->
      expect($('body.dark').length).toBeTruthy()

  it 'should be light after toggle', ->

    waitsFor ->
      yepnope.COMPLETED || (window.jQuery && !window.yepnope.complete)
    , "yepnope never completed", 10000
    
    runs ->
      window.toggleTheme()
      expect($('body.light').length).toBeTruthy()