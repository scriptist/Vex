/* Written by Michael Berman @ HotHouse Interactive */

jQuery.fn.popup = function(arg) {
	var $elm = this;

	init = function(options) {
		var defaults = {
			animDuration: 300,				// Animation duration
			backgroundCloses: true,			// Clicking the background will close the popup
			backgroundColor: '#000',		// The colour of the background
			backgroundOpacity: 0.5,			// The opacity of the background
			closeButton: false,				// Include a close button up the top right
			height: 'auto',					// The height of the popup in px or 'auto'
			modal: true,					// Modals have a greyed-out background
			onOpen: undefined,				// Function called before the popup opens (return false to cancel opening)
			onOpenEnd: undefined,			// Once the popup has faded in
			onClose: undefined,				// As soon as the popup begins to close
			onCloseEnd: undefined,			// When the popup has faded out
			openImmediately: false,			// Should the popup open right now?
			popupBackground: '#fff',		// Background colour of the popup
			popupBorder: '1px solid #333',	// Border of the popup
			prefix: 'popup-',				// CSS prefix before all classes
			width: '33%',					// How wide should the popup be (in px or %)
			widthMin: 200,					// Minimum width
			widthMax: undefined,			// Maximum width
			zIndex: 10000					// z-index of the popup (modal background will have zIndex-1)
		};
		var settings = $.extend({}, defaults, options);
		if ($elm.data('popup'))
			destroy();

		settings.isOpen = false;
		$elm.data('popup', settings).hide();
		if (settings.openImmediately)
			open();

		return $elm;
	};
	var destroy = function() {
		var settings = $elm.data('popup');
		if (typeof settings != 'object')
			return $elm;
		if (settings.isOpen) {
			settings.animDuration = 0;
			settings.onCloseEnd = function() {
				$elm.popup('destroy');
			};
			return $elm.data('popup', settings).popup('close');
		}
		return $elm.unbind('.popup').data('popup', undefined).show();
	};
	var open = function() {
		var height,
			width,
			top,
			marginLeft,
			$window = $(window);
			scrollPos = Math.max($('body').scrollTop(), $('html').scrollTop(), $(window).scrollTop());
		if (!$elm.data('popup'))
			return init({openImmediately: true});
		var settings =  $elm.data('popup')
		if (settings.isOpen)
			return $elm; // It is already open
		if (typeof settings.onOpen == 'function' && settings.onOpen() === false)
			return $elm; // onOpen function says no

		var $placeholder = $('<div>');
		$placeholder
			.attr('class', $elm.attr('class'))
			.data('popup', {placeholderFor: $elm});
		$elm.replaceWith($placeholder);

		var $popupContainer = $('<div>').addClass(settings.prefix + 'container').hide();
		var $popupElm = $('<div>');
		// Create element
		$popupElm
			.addClass(settings.prefix + 'element')
			.append($elm)
			.appendTo($popupContainer);
		height = settings.height;
		width = settings.width;
		top = ($window.height() - height) / 2 + scrollPos;
		if (typeof width == 'string' && width.charAt(width.length - 1) == '%') {
			width = $window.width() * parseInt(width, 10) / 100;
		}
		if (parseInt(height) != height) {
			height = 'auto';
			top = ($window.height() - $popupElm.outerHeight()) / 3 + scrollPos;
		}
		if (top < scrollPos)
			top = scrollPos;
		if (typeof settings.widthMin == 'number' && width < settings.widthMin)
			width = settings.widthMin;
		if (typeof settings.widthMax == 'number' && width > settings.widthMax)
			width = settings.widthMax;
		marginLeft = -width / 2;
		$popupElm
			.css({
				'background-color': settings.popupBackground,
				'border': settings.popupBorder,
				'left': '50%',
				'height': height,
				'margin-left': marginLeft,
				'position': 'absolute',
				'top': top,
				'width': width,
				'z-index': settings.zIndex
			});
		$elm.show();
		if (settings.closeButton) {
			var $closeButton = $('<span>&times;</span>');
			$closeButton
				.addClass('close')
				.css({
					'cursor': 'pointer',
					'position': 'absolute',
					'right': 5,
					'top': 0
				})
				.bind('click.popup', function() {
					$elm.popup('close');
				})
				.appendTo($popupElm);
		}
		// Create background
		if (settings.modal) {
			var $bgElm = $('<div>');
			$bgElm
				.addClass(settings.prefix + 'background')
				.css({
					'background-color': settings.backgroundColor,
					'bottom': 0,
					'left': 0,
					'opacity': settings.backgroundOpacity,
					'position': 'fixed',
					'right': 0,
					'top': 0,
					'z-index': settings.zIndex-1
				})
				.appendTo($popupContainer);
			if (settings.backgroundCloses) {
				$bgElm
					.css('cursor', 'pointer')
					.bind('click.popup', function() {
						$elm.popup('close');
					});
			}
		}

		settings.isOpen = true;
		settings.placeholder = $placeholder;
		settings.container = $popupContainer;
		$elm.data('popup', settings);

		// Fade in
		$popupContainer.appendTo('body').fadeIn(settings.animDuration, function() {
			if (typeof settings.onOpenEnd == 'fucntion')
				settings.onOpenEnd();
		});

		return $elm;
	};
	var close = function() {
		var settings =  $elm.data('popup');
		if (!settings || !settings.isOpen)
			return $elm; // Is already closed
		if (typeof settings.onClose == 'function' && settings.onClose() === false)
			return $elm; // onClose function says no

		// Fade out
		settings.container.fadeOut(settings.animDuration, function() {
			settings.placeholder.replaceWith($elm.hide());
			settings.container.remove();
			settings.isOpen = false;
			settings.placeholder = undefined;
			settings.container = undefined;
			$elm.data('popup', settings);
			if (typeof settings.onCloseEnd == 'function')
				settings.onCloseEnd();
		});
		return $elm;
	};



	var settings = $elm.data('popup');
	if (settings && 'placeholderFor' in settings) {
		// This is just a placeholder, not the real element
		return settings.placeholderFor.popup(arg);
	}

	if (typeof arg == 'object' || typeof arg == 'undefined') {
		init(arg);
	} else if (typeof arg == 'string') {
		if (arg == 'close')
			return close();
		if (arg == 'destroy')
			return destroy();
		if (arg == 'init')
			return init();
		if (arg == 'open')
			return open();
	}

	return $elm;
};