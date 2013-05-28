vex = {
	elm: {
		container: null,
		video: null,
		$toAnimate: null
	},
	data: {
		lastTime: null
	},
	defaults: {
		transitionDuration: 0.5
	},
	evts: [],
	initialised: false,
	init: function() {
		// Find elements
		var container = vex.elm.container = $('[data-vex-container]')[0],
			video     = vex.elm.video     = $('[data-vex-video]')[0],
			$toAnimate = vex.elm.$toAnimate = $(vex.elm.container).find('[data-vex-in], [data-vex-out]');

		// Check elements exist
		if (!container || !video || vex.initialised)
			return false;

		// Set up elements
		vex.initElements($toAnimate);

		// Trigger events
		video.addEventListener('timeupdate', vex.onTimeUpdate);
		video.addEventListener('seeked', vex.onSeeked);

		// Confirm it's initialised
		vex.initialised = true;
	},
	initElements: function(elms) {
		$(elms).each( function() {
			var elm = this,
				timeIn = parseFloat(elm.getAttribute('data-vex-in')),
				timeOut = parseFloat(elm.getAttribute('data-vex-out'));

			if (!isNaN(timeIn)) {
				vex.bind(timeIn, function() {
					vex.elmIn(elm);
				});
			} else {
				vex.elmIn(elm);
			}
			if (!isNaN(timeOut)) {
				vex.bind(timeOut, function() {
					vex.elmOut(elm);
				});
			}
		});
	},
	resetElements: function(elms) {
		$(elms).each( function() {
			vex.elmReset(this);
		});
		vex.data.lastTime = 0;
		vex.onTimeUpdate();
	},
	elmTransition: function(elm, duration) {
		if (duration = parseFloat(duration)) {
			$(elm).css('transition', 'all ' + duration + 's');
		} else {
			$(elm).css('transition', '');
		}
	},
	elmIn: function(elm) {
		var duration = parseFloat(elm.getAttribute('data-vex-duration')) || vex.defaults.transitionDuration;
		vex.elmTransition(elm, duration);
		$(elm).addClass('vex-in');
	},
	elmOut: function(elm) {
		var duration = parseFloat(elm.getAttribute('data-vex-duration')) || vex.defaults.transitionDuration;
		vex.elmTransition(elm, duration);
		$(elm).removeClass('vex-in').addClass('vex-out');
	},
	elmReset: function(elm) {
		var duration = parseFloat(elm.getAttribute('data-vex-duration')) || vex.defaults.transitionDuration;
		vex.elmTransition(elm, duration);
		$(elm).removeClass('vex-in vex-out');
	},
	bind: function(t, f, a) { // time (in seconds), function, arguments
		if ((parseFloat(t) == t || parseInt(t) == t) && typeof f == 'function') {
			vex.evts.push({
				t: t,
				f: f,
				a: a
			});
			vex.sortEvents();
			return true;
		}
		return false;
	},
	sortEvents: function() {
		var compare = function(a,b) {
			if (a.t < b.t)
				return -1;
			if (a.t > b.t)
				return 1;
			return 0;
		}
		return vex.evts.sort(compare);
	},
	onTimeUpdate: function(e) {
		var lastTime      = vex.data.lastTime,
			currentTime   = vex.elm.video.currentTime;

		if (vex.elm.video.seeking)
			return;

		vex.data.lastTime = currentTime;

		if (lastTime = null)
			return;

		// Find & trigger events
		for (var i = 0; i < vex.evts.length; i++) {
			var t = vex.evts[i].t;
			if (t < lastTime) {
				continue;
			} else if (t >= lastTime && t < currentTime) {
				vex.evts[i].f.apply(vex.elm.video, vex.evts[i].a);
			} else {
				break;
			}
		}
	},
	onSeeked: function(e) {
		vex.resetElements(vex.elm.$toAnimate);
		vex.data.lastTime = 0;
	}
}

vex.init();