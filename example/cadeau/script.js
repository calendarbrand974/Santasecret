gsap.registerPlugin(CustomEase, EasePack, CustomWiggle);

jQuery(function($) {
  $('.svg-wrapper [data-origin]').each(function(index) {
		//	Do some error-checking, just in case I missed one
		
		var thisName = ($(this).is('[class]')) ? '.' + $(this).attr('class') : '#' + $(this).attr('id');
		thisName += ' ' + this.nodeName;

		if ($(this).is('[data-origin]')) {
			var tOrig = $(this).attr('data-origin');
			if (tOrig) {
				
				gsap.set($(this).get(0), { transformOrigin: tOrig });
			} else {
				
			}
		} else {
			
		}
	});
  
  gsap.set('g.surprise-gift .confetti', { opacity: 0 });
	for (i = 0; i < $('g.surprise-gift .confetti rect').length; i++) {
		var confetto = $('g.surprise-gift .confetti rect')[i];
		var randX = (Math.random() * 6) * 100;
		var xPos = randX + 50;
		var dataAngle = (randX / 15) - 20;

		gsap.set(confetto, { xPercent: xPos, attr: { 'data-angle': dataAngle, 'data-x': xPos }, rotation: Math.random() * 180, scale: (Math.random() * 0.5) + 0.5 });
		gsap.to(confetto, { scaleX: 0.2, rotation: Math.random() * 360, duration: ((Math.random() * 10) / 10) + 0.25, repeat: -1, yoyo: true, ease:'sine.inOut' });
	}
	let surpriseTL = gsap.timeline({ repeat: -1, repeatDelay: 2, delay: 0.5 });
	CustomWiggle.create('giftShake', { wiggles: 60, timingEase: 'expo.out' });
	surpriseTL.to('g.surprise-gift', { rotation: 2.5, duration: 2, ease: 'giftShake', onStart: function() { $('.bg').removeClass('gift-open'); } });
	surpriseTL.to('g.surprise-gift .lid', { yPercent: -70, rotation: -5, duration: 0.25, delay: -0.15, ease: 'back.out(4)', onStart: function() { $('.bg').addClass('gift-open'); } });
	surpriseTL.to('g.surprise-gift .lid-cast-shadow', { scaleY: 2, opacity: 0, duration: 0.25, delay: -0.4, ease: 'expo.in' });
	surpriseTL.set('g.surprise-gift .confetti rect', { opacity: 1 }, '<0.15');
	surpriseTL.set('g.surprise-gift .confetti', { opacity: 1, onComplete: sprinkleConfetti }, '<0');
	surpriseTL.to('g.surprise-gift .lid', { yPercent: 0, rotation: 0, duration: 0.5, delay: 1, ease: 'bounce.out' });
	surpriseTL.to('g.surprise-gift .lid-cast-shadow', { scaleY: 1, opacity: 1, duration: 0.5, delay: -0.5, ease: 'bounce.out' });

	///
	//	Confetti generation
	//	https://greensock.com/forums/topic/11026-confetti-with-greensock/
	///

	function sprinkleConfetti() {
		for (i = 0; i < $('g.surprise-gift .confetti rect').length; i++) {
			var peakY = (Math.random() * 30) + 20;
			var upTime = ((Math.random() * 10) / 10) + 0.1;
			var downTime = (Math.random() * 1) + 0.5;
			var confetto = $('g.surprise-gift .confetti rect')[i];
			var jConfetto = $(confetto);
			var dataAngle = jConfetto.attr('data-angle');

			var confettoTL = gsap.timeline();
			confettoTL.to(confetto, { x: '+=' + dataAngle, y: -peakY, duration: upTime, ease: 'expo.out' });
			confettoTL.to(confetto, { y: 60, opacity: 1, duration: downTime, ease: 'linear', onComplete: function() { var elem = this.targets()[0]; gsap.set(elem, { x: 0, y: 0, opacity: 0 }); } });
		}
	}
});