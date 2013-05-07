;(function($, window, undefined){
	window.console && console.log('Welcome to main.js.');

	var $body = $('body'),
		$button = $('#theme'),
		dark = $button.text(),
		light = 'Switch to Dark';
	function toggleTheme() {
		$body.toggleClass('light dark');
		var text = $body.hasClass('light') ? light : dark;
		$button.text(text);
	}
	function bindButton() {
		$body.addClass('dark');
		$button.click(toggleTheme);
	}

	$(bindButton);

})(jQuery, this);