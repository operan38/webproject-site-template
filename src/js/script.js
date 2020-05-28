$(document).ready(() => {
	AOS.init();

	$('.js-header__toggle').on('click', () => {
		$('.js-header__toggle, .js-header__nav').toggleClass('active');
		$('html, body').toggleClass('lock');
	});

	/* $(document).on('scroll', () => {
		let isStickyHeader = false;

		if ($(window).scrollTop() >= $('.header').outerHeight() + 20 && !isStickyHeader) {
			$('.header').css('top', '-100px');
			$('.header').css('position', 'fixed');
			$('.header').css('width', '100%');

			$('.header').stop();

			$('.header').animate({
				top: '0px',
			}, 400, 'linear', () => {});

			isStickyHeader = true;
		} else {
			$('.header').removeAttr('style');
			isStickyHeader = false;
		}
	}); */
});
