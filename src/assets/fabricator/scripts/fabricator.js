'use strict';

require('./prism');


const config = {
	selectors: {
		sidebar: '[data-f-sidebar]',
		fullscreenNav: '[data-f-fullscreen-nav]',
		toggleFullscreenNav: '[data-f-toggle-nav]',
		toggleCode: '[data-f-toggle-code]',
		toggleDetail: '[data-f-toggle-Detail]',
	},
}


/**
 * Global `fabricator` object
 * @namespace
 */
var fabricator = window.fabricator = {};


/**
 * Default options
 * @type {Object}
 */
fabricator.options = {
	toggles: {
		labels: true,
		notes: true,
		code: true
	},
	menu: false,
	mq: '(min-width: 60em)'
};

// open menu by default if large screen
fabricator.options.menu = window.matchMedia(fabricator.options.mq).matches;

/**
 * Cache DOM
 * @type {Object}
 */
fabricator.dom = {
	root: document.querySelector('html'),
	primaryMenu: document.querySelector(config.selectors.sidebar),
	menuItems: document.querySelectorAll('.f-menu li a'),
	menuToggle: document.querySelector('.f-menu-toggle')
};


/**
 * Build color chips
 */
fabricator.buildColorChips = function () {

	var chips = document.querySelectorAll('.f-color-chip'),
		color;

	for (var i = chips.length - 1; i >= 0; i--) {
		color = chips[i].querySelector('.f-color-chip__color').innerHTML;
		chips[i].style.borderTopColor = color;
		chips[i].style.borderBottomColor = color;
	}

	return this;

};


/**
 * Add `f-active` class to active menu item
 */
fabricator.setActiveItem = function () {

	/**
	 * @return {Array} Sorted array of menu item 'ids'
	 */
	var parsedItems = function () {

		var items = [],
			id, href;

		for (var i = fabricator.dom.menuItems.length - 1; i >= 0; i--) {

			// remove active class from items
			fabricator.dom.menuItems[i].classList.remove('f-active');

			// get item href
			href = fabricator.dom.menuItems[i].getAttribute('href');

			// get id
			if (href.indexOf('#') > -1) {
				id = href.split('#').pop();
			} else {
				id = href.split('/').pop().replace(/\.[^/.]+$/, '');
			}

			items.push(id);

		}

		return items.reverse();

	};


	/**
	 * Match the 'id' in the window location with the menu item, set menu item as active
	 */
	var setActive = function () {
		var href = window.location.href,
			items = parsedItems(),
			id, index;

		// get window 'id'
		if (href.indexOf('#') > -1) {
			id = window.location.hash.replace('#', '');
		} else {
			id = window.location.pathname.split('/').pop().replace(/\.[^/.]+$/, '');
		}

		// In case the first menu item isn't the index page.
		if (id === '') {
			id = 'index';
		}

		// find the window id in the items array
		index = (items.indexOf(id) > -1) ? items.indexOf(id) : 0;

		// set the matched item as active
		// fabricator.dom.menuItems[index].classList.add('f-active');

	};

	window.addEventListener('hashchange', setActive);

	setActive();

	return this;

};


/**
 * Click handler to primary menu toggle
 * @return {Object} fabricator
 */
fabricator.menuToggle = function () {
	// shortcut menu DOM
	var toggle = fabricator.dom.menuToggle;

	var options = fabricator.options;

	// toggle classes on certain elements
	var toggleClasses = function () {
		options.menu = !fabricator.dom.root.classList.contains('f-state--sidebar-active');
		fabricator.dom.root.classList.toggle('f-state--sidebar-active');
	};

	// toggle classes on click
	// toggle.addEventListener('click', function () {
	// 	toggleClasses();
	// });

	// close menu when clicking on item (for collapsed menu view)
	var closeMenu = function () {
		if (!window.matchMedia(fabricator.options.mq).matches) {
			toggleClasses();
		}
	};

	for (var i = 0; i < fabricator.dom.menuItems.length; i++) {
		fabricator.dom.menuItems[i].addEventListener('click', closeMenu);
	}

	return this;

};


/**
 * Handler for preview and code toggles
 * @return {Object} fabricator
 */
fabricator.allItemsToggles = function () {

	var items = {
		labels: document.querySelectorAll('[data-f-toggle="labels"]'),
		notes: document.querySelectorAll('[data-f-toggle="notes"]'),
		code: document.querySelectorAll('[data-f-toggle="code"]')
	};

	var toggleAllControls = document.querySelectorAll('.f-controls [data-f-toggle-control]');

	var options = fabricator.options;

	// toggle all
	var toggleAllItems = function (type, value) {
		var button = document.querySelector('.f-controls [data-f-toggle-control=' + type + ']'),
			_items = items[type];

		for (var i = 0; i < _items.length; i++) {
			if (value) {
				_items[i].classList.remove('f-item-hidden');
			} else {
				_items[i].classList.add('f-item-hidden');
			}
		}

		// toggle styles
		// if (value) {
		// 	button.classList.add('f-active');
		// } else {
		// 	button.classList.remove('f-active');
		// }

		// update options
		options.toggles[type] = value;
	};

	for (var i = 0; i < toggleAllControls.length; i++) {

		toggleAllControls[i].addEventListener('click', function (e) {

			// extract info from target node
			var type = e.currentTarget.getAttribute('data-f-toggle-control'),
				value = e.currentTarget.className.indexOf('f-active') < 0;

			// toggle the items
			toggleAllItems(type, value);

		});

	}

    for (let isolationButton of document.querySelectorAll('[data-f-toggle-control="isolation"]')) {
        isolationButton.addEventListener('click', function (e) {
            let target = e.target.getAttribute('data-f-isolation-target');
            if (!target) {
                target = e.target.parentElement.getAttribute('data-f-isolation-target');
            }

            insertParam('detail', target);

            const isolationContent = document.querySelector(`[data-f-isolation-content="${target}"]`).innerHTML;
            document.body.classList.add('f-isolation-active');
            setTimeout(() => {
                document.querySelector(`[data-f-normal-view]`).classList.remove('active');
            }, 200);
            document.querySelector(`[data-f-isolation-markup]`).innerHTML = isolationContent
            document.querySelector(`[data-f-isolation-title]`).innerHTML = target
        });
    }

    // document.querySelector('[data-f-isolation-close]').addEventListener('click', function (e) {
    //     document.body.classList.remove('f-isolation-active');
    //     document.querySelector(`[data-f-normal-view]`).classList.add('active');
    //     document.querySelector(`[data-f-isolation-markup]`).innerHTML = '';
    //     document.querySelector(`[data-f-isolation-title]`).innerHTML = '';
    //     removeParam('detail');
    //     removeParam('grid');

    //     if (document.body.className.indexOf('f-isolation-grid-active') > -1) {
    //         document.body.classList.remove('f-isolation-grid-active');
    //     }
    // });

    // document.querySelector('[data-f-isolation-grid-toggle]').addEventListener('click', function (e) {
    //     let isActive = document.body.className.indexOf('f-isolation-grid-active') > -1;
    //     if (isActive) {
    //         document.body.classList.remove('f-isolation-grid-active');
    //         removeParam('grid');
    //     } else {
    //         document.body.classList.add('f-isolation-grid-active');
    //         insertParam('grid', 'true');
    //     }
    // });

	// persist toggle options from page to page
	for (var toggle in options.toggles) {
		if (options.toggles.hasOwnProperty(toggle)) {
			toggleAllItems(toggle, options.toggles[toggle]);
		}
	}

	return this;

};


/**
 * Handler for single item code toggling
 */
fabricator.singleItemToggle = function () {

	var itemToggleSingle = document.querySelectorAll('.f-item-group [data-f-toggle-control]');

	// toggle single
	var toggleSingleItemCode = function (e) {
		var group = this.parentNode.parentNode.parentNode,
			type = e.currentTarget.getAttribute('data-f-toggle-control');

        if (type !== 'isolation') {
		    group.querySelector('[data-f-toggle=' + type + ']').classList.toggle('f-item-hidden');
        }
	};

	for (var i = 0; i < itemToggleSingle.length; i++) {
		itemToggleSingle[i].addEventListener('click', toggleSingleItemCode);
	}

	return this;

};


/**
 * Automatically select code when code block is clicked
 */
fabricator.bindCodeAutoSelect = function () {
	var codeBlocks = document.querySelectorAll('.f-item-code');
	var select = function (block) {
		var selection = window.getSelection();
		var range = document.createRange();
		range.selectNodeContents(block.querySelector('code'));
		selection.removeAllRanges();
		selection.addRange(range);
	};
	for (var i = codeBlocks.length - 1; i >= 0; i--) {
		codeBlocks[i].addEventListener('click', select.bind(this, codeBlocks[i]));
	}
};


/**
 * Open/Close menu based on session var.
 * Also attach a media query listener to close the menu when resizing to smaller screen.
 */
fabricator.setInitialMenuState = function () {
	// root element
	var mq = window.matchMedia(fabricator.options.mq);

	// if small screen
	var mediaChangeHandler = list => {
		if (!list.matches) fabricator.dom.root.classList.remove('f-state--sidebar-active');
		else fabricator.dom.root.classList.add('f-state--sidebar-active');
	};

	mq.addListener(mediaChangeHandler);
	mediaChangeHandler(mq);

	return this;

};


/**
 * Initialization
 */
(function () {

	// invoke
	fabricator
		.setInitialMenuState()
		.menuToggle()
		.allItemsToggles()
		.singleItemToggle()
		.buildColorChips()
		.setActiveItem()
		.bindCodeAutoSelect();

}());

function insertParam(key, value) {
    //Get query string value
	var searchUrl=location.search;
	if(searchUrl.indexOf("?")== "-1") {
		var urlValue='?'+key+'='+value;
		history.pushState({state:1, rand: Math.random()}, '', urlValue);
	}
	else {
		//Check for key in query string, if not present
		if(searchUrl.indexOf(key)== "-1") {
			var urlValue=searchUrl+'&'+key+'='+value;
		}
		else {	//If key present in query string
			let oldValue = getParameterByName(key);
			if(searchUrl.indexOf("?"+key+"=")!= "-1") {
				urlValue = searchUrl.replace('?'+key+'='+oldValue,'?'+key+'='+value);
			}
			else {
				urlValue = searchUrl.replace('&'+key+'='+oldValue,'&'+key+'='+value);
			}
		}
		history.pushState({state:1, rand: Math.random()}, '', urlValue);
		//history.pushState function is used to add history state.
		//It takes three parameters: a state object, a title (which is currently ignored), and (optionally) a URL.
	}
}

function removeParam(key) {
	var urlValue=document.location.href;

	//Get query string value
	var searchUrl=location.search;

	if(key!="") {
		let oldValue = getParameterByName(key);
		let removeVal=key+"="+oldValue;
		if(searchUrl.indexOf('?'+removeVal+'&')!= "-1") {
			urlValue=urlValue.replace('?'+removeVal+'&','?');
		}
		else if(searchUrl.indexOf('&'+removeVal+'&')!= "-1") {
			urlValue=urlValue.replace('&'+removeVal+'&','&');
		}
		else if(searchUrl.indexOf('?'+removeVal)!= "-1") {
			urlValue=urlValue.replace('?'+removeVal,'');
		}
		else if(searchUrl.indexOf('&'+removeVal)!= "-1") {
			urlValue=urlValue.replace('&'+removeVal,'');
		}
	}
	else {
		var searchUrl=location.search;
		urlValue=urlValue.replace(searchUrl,'');
	}
	history.pushState({state:1, rand: Math.random()}, '', urlValue);
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getFlaggedString(string, startFlag, endFlag) {
	var flaggedString = '';
	var index = string.indexOf(startFlag);

	if (index > -1) {
		var start = index;
		var end = string.indexOf(endFlag);

		if (end > -1 && end > start) {
			flaggedString = string.substr(start, end - start + endFlag.length);
		}
	}

	return flaggedString;
};

document.addEventListener("DOMContentLoaded", function(event) {
    // get URL params
    let isolationTarget = getParameterByName('detail')
    let gridActive = getParameterByName('grid')
    if (isolationTarget && isolationTarget !== '' && isolationTarget !== 'null') {
        const isolationContent = document.querySelector(`[data-f-isolation-content="${isolationTarget}"]`).innerHTML;
        document.body.classList.add('f-isolation-active');
        document.querySelector(`[data-f-isolation-markup]`).innerHTML = isolationContent
    }
    if (gridActive !== true) {
        document.body.classList.add('f-isolation-grid-active');
    }

    Prism.hooks.add('before-highlight', function (env) {
		var element = env.element;
		var code = env.code;
		var codeToHide = getFlaggedString(code, '<no-highlight>', '</no-highlight>');
		if (codeToHide.length > 0) env.code = code.replace(codeToHide, '');
	});

    window.Prism.highlightAll();
    // console.log(document.querySelector(`[data-f-isolation-markup]`).innerHTML)

    document.querySelector(config.selectors.toggleFullscreenNav).addEventListener('click', function() {
    	let isActive = fabricator.dom.root.className.indexOf('f-state--menu-active') > -1;
        if (isActive) {
            fabricator.dom.root.classList.remove('f-state--menu-active');
        } else {
            fabricator.dom.root.classList.add('f-state--menu-active');
        }
    });

    document.querySelector(config.selectors.fullscreenNav).addEventListener('click', function() {
        fabricator.dom.root.classList.remove('f-state--menu-active');
    });
});
