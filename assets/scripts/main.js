;(function($, window, undefined){
	window.console && console.log('Welcome to main.js.');

	var $body = $('body'),
		$button = $('#theme'),
		light = $button.text(),
		dark = 'Switch to Light';
	function toggleTheme() {
		$body.toggleClass('dark');
		var text = $body.hasClass('dark') ? dark : light;
		$button.text(text);
	}
	function bindButton() {
		$button.click(toggleTheme);
	}

	$(bindButton);

})(jQuery, this);