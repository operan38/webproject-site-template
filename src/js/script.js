$(document).ready(() => {
	AOS.init({
		disable: 'phone',
	});

	$('.js-header__toggle').on('click', () => {
		$('.js-header__toggle, .js-header__nav').toggleClass('active');
		$('body').toggleClass('lock');
	});

	$(window).on('scroll', function () {
		const headerHeight = $('.header').outerHeight();
		const scrollPos = $(this).scrollTop();

		if ($(window).width() > 992) {
			$('section').each(function () {
				const top = $(this).offset().top - headerHeight;
				const bottom = top + $(this).outerHeight();

				if (scrollPos >= top && scrollPos <= bottom) {
					$('.header__nav-link').removeClass('active');
					$('section').removeClass('active');

					$(this).addClass('active');
					$(`.header__nav-link[href="#${$(this).attr('id')}"]`).addClass('active');
				}
			});
		}
	});

	$('.go-to-link').on('click', function () {
		const $el = $(this);
		const id = $el.attr('href');
		const headerHeight = $('.header').outerHeight();

		if ($(window).width() <= 992) {
			$('.js-header__toggle, .js-header__nav').removeClass('active');
			$('body').removeClass('lock');
		}

		$('html, body').animate({
			scrollTop: $(id).offset().top - headerHeight,
		}, 500);
	});

	$('.js-latest-works-slider').owlCarousel({
		loop: true,
		responsiveClass: true,
		margin: 0,
		responsive: {
			0: {
				items: 2,
			},
			768: {
				items: 3,
			},
		},
	});

	$().fancybox({
		selector: '.owl-item:not(.cloned) .latest-works__slider-item a',
		buttons: [
			'close',
		],
	});

	$(window).scroll();
});
