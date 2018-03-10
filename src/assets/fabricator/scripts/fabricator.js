import { getParamByName, addParam, removeParam, getFlaggedString, toggleDataAttribute, setDataAttribute } from './utility'
import { initProgressNav } from './progress-nav'
import jump from './jump'
import Split from 'split.js'
import store from 'store'
import Clipboard from 'clipboard'

// const tailwindConfig = require('../../../../tailwind.config.js')
// console.log(tailwindConfig)

let storageKey = 'aw765dvawdgaw56'
let storageKeyResize = `${storageKey}:show-resize`
let storageKeyRuler = `${storageKey}:show-ruler`

let fullscreenActive = false
let fullscreenResizeActive = store.get(storageKeyResize) === true
let fullscreenRulerActive = store.get(storageKeyRuler) === true

require('./prism')
import ruler from './ruler'

let splitInstance = null
let rulerInstance = null

/**
 * Global config
 */
const config = {
	selectors: {
		root: 'html',
		sidebar: '[data-f-sidebar]',
		navToggle: '[data-f-toggle-nav]',
		navMobile: '[data-f-nav--mobile]',
		navItems: '.f-link--item',
		navCategoryItems: '.f-link--category',
		fullscreen: '[data-f-fullscreen]',
		fullscreenOpen: '[data-f-open-fullscreen]',
		fullscreenClose: '[data-f-close-fullscreen]',
		fullscreenMarkup: '[data-f-fullscreen-markup]',
		fullscreenTitle: '[data-f-fullscreen-title]',
		rulerToggle: '[data-f-toggle-ruler]',
		resizeToggle: '[data-f-toggle-resize]',
		toast: '[data-f-toast]',
	},
}

/**
 * Global `fabricator` object
 * @namespace
 */
let fabricator = window.fabricator = {}

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
	mq: '(min-width: 55em)',
}
// open menu by default if large screen
fabricator.options.menu = window.matchMedia(fabricator.options.mq).matches

/**
 * Cache DOM
 * @type {Object}
 */
fabricator.dom = {
	root: document.querySelector(config.selectors.root),
	sidebar: document.querySelector(config.selectors.sidebar),
	navItems: document.querySelectorAll(config.selectors.navItems),
	navCategoryItems: document.querySelectorAll(config.selectors.navCategoryItems),
	navToggle: document.querySelector(config.selectors.navToggle),
	resizeToggle: document.querySelector(config.selectors.resizeToggle),
	rulerToggle: document.querySelector(config.selectors.rulerToggle),
}


/**
 * Add `f-active` class to active menu item
 */
const setActiveItem = () => {

	/**
	 * @return {Array} Sorted array of menu item 'ids'
	 */
	const getParsedItems = () => {

		var items = [],
			id, 
			href

		for (var i = fabricator.dom.navItems.length - 1; i >= 0; i--) {

			// remove active class from items
			fabricator.dom.navItems[i].classList.remove('f-active')

			// get item href
			href = fabricator.dom.navItems[i].getAttribute('href')

			// get id
			if (href.indexOf('#') > -1) {
				id = href.split('#').pop()
			} else {
				id = href.split('/').pop().replace(/\.[^/.]+$/, '')
			}

			items.push(id)

		}

		return items.reverse()
	}


	/**
	 * Match the 'id' in the window location with the menu item, set menu item as active
	 */
	var setActive = () => {
		var href = window.location.href,
			items = getParsedItems(),
			id, index

		// get window 'id'
		if (href.indexOf('#') > -1) {
			id = window.location.hash.replace('#', '')
		} else {
			id = window.location.pathname.split('/').pop().replace(/\.[^/.]+$/, '')
		}

		// In case the first menu item isn't the index page.
		if (id === '') {
			id = 'index'
		}

		// find the window id in the items array
		index = (items.indexOf(id) > -1) ? items.indexOf(id) : 0

		// set the matched item as active
		// fabricator.dom.navItems[index].classList.add('f-active')

	}

	window.addEventListener('hashchange', setActive)

	setActive()
}

/**
 * Open/Close menu based on session var.
 * Also attach a media query listener to close the menu when resizing to smaller screen.
 */
const setInitialMenuState = () => {
	// root element
	let mq = window.matchMedia(fabricator.options.mq)

	// if small screen
	const mediaChangeHandler = list => {
		if (!list.matches) fabricator.dom.root.classList.remove('f-state--sidebar-active')
		else fabricator.dom.root.classList.add('f-state--sidebar-active')
	}

	mq.addListener(mediaChangeHandler)
	mediaChangeHandler(mq)
}

/**
 * activate fullscreen view
 */
const activateFullscreenMode = key => {
    fullscreenActive = true
	setDataAttribute(config.selectors.root, 'data-f-state--fullscreen', 'active')
	addParam('detail', key);
    const content = document.querySelector(`[data-f-fullscreen-content-key="${key}"]`).innerHTML;
    const name = document.querySelector(`[data-f-fullscreen-title-key="${key}"]`).innerHTML;
    document.querySelector(config.selectors.fullscreenMarkup).innerHTML = content
    document.querySelector(config.selectors.fullscreenTitle).innerHTML = name
	if (fullscreenRulerActive) activateFullscreenRuler()
}

/**
 * deactivate fullscreen view
 */
const deactivateFullscreenMode = () => {
    fullscreenActive = false
	setDataAttribute(config.selectors.root, 'data-f-state--fullscreen', '')
    removeParam('detail')
    document.querySelector(config.selectors.fullscreenMarkup).innerHTML = ''
    document.querySelector(config.selectors.fullscreenTitle).innerHTML = ''
}


/**
 * activate resize controls in fullscreen view
 */
const activateFullscreenResize = () => {
	setDataAttribute(config.selectors.root, 'data-f-state--fullscreen-resize', 'active')
	store.set(storageKeyResize, true)
	splitInstance = Split(['[data-f-fullscreen-markup]', '[data-f-fullscreen-markup-negative]'], {
	    sizes: [100, 0],
	    minSize: 50,
	    snapOffset: 0,
	    gutterSize: 30
	})

	let gutter = document.querySelector('.gutter')
	if (gutter) {
		gutter.innerHTML = `
			<svg>
                <use xlink:href="#f-icon-resize" />
            </svg>
		`
	}
}

/**
 * deactivate resize controls in fullscreen view
 */
const destroyFullscreenResize = () => {
	setDataAttribute(config.selectors.root, 'data-f-state--fullscreen-resize', '')
	store.set(storageKeyResize, false)
	if (splitInstance !== null) splitInstance.destroy()
}

/**
 * activate ruler in fullscreen view
 */
const activateFullscreenRuler = () => {
	fullscreenRulerActive = true
	setDataAttribute(config.selectors.root, 'data-f-state--fullscreen-ruler', 'active')
	store.set(storageKeyRuler, true)
	rulerInstance = new ruler({
        container: document.querySelector(config.selectors.fullscreenMarkup),// reference to DOM element to apply rulers on
        rulerHeight: 35, // thickness of ruler
        fontFamily: 'monospace',// font for points
        fontSize: '11px', 
        trackerColor: 'red',
        strokeStyle: '#999',
        lineWidth: 1,
        enableMouseTracking: true,
        enableToolTip: true
    })
}

/**
 * deactivate ruler in fullscreen view
 */
const destroyFullscreenRuler = () => {
	fullscreenRulerActive = false
	setDataAttribute(config.selectors.root, 'data-f-state--fullscreen-ruler', '')
	store.set(storageKeyRuler, false)
	if (rulerInstance !== null) rulerInstance.api.destroy()
}

/**
 * toggles mobile nav
 */
const toggleNav = () => {
	if (!window.matchMedia(fabricator.options.mq).matches) {
		fabricator.options.menu = !fabricator.dom.root.classList.contains('f-state--menu-active')
		fabricator.dom.root.classList.toggle('f-state--menu-active')
	}
}

/**
 * uses jump.js to make an animated scroll jump to the element with specified attribute data-key
 */
const jumpToKey = key => {
	jump(`[data-key="${key}"]`, {
	  container: '[data-f-jump-container]',
	  duration: 100,
	  offset: -30
	})
}

/**
 * binds styleguide event handlers
 */
const bindEventHandlers = () => {
	var items = {
		labels: document.querySelectorAll('[data-f-toggle="labels"]'),
		notes: document.querySelectorAll('[data-f-toggle="notes"]'),
		code: document.querySelectorAll('[data-f-toggle="code"]')
	}

	var options = fabricator.options

    for (let fullscreenToggle of document.querySelectorAll(config.selectors.fullscreenOpen)) {
        fullscreenToggle.addEventListener('click', event => { 
        	let attrName = 'data-f-fullscreen-key'
			let key = event.target.getAttribute(attrName) || event.target.parentElement.getAttribute(attrName)
        	activateFullscreenMode(key)
        })
    }

    document.querySelector(config.selectors.fullscreenClose).addEventListener('click', () => {
    	deactivateFullscreenMode()
    })

    // document.querySelector(config.selectors.gridToggle).addEventListener('click', toggleGridHelper)

	// close menu when clicking on item (for collapsed menu view)
	for (let item of fabricator.dom.navItems) {
		item.addEventListener('click', event => {
			toggleNav()
			if (event.target.dataset.jumpTarget) { jumpToKey(event.target.dataset.jumpTarget) }				
		})
	}
	for (let item of fabricator.dom.navCategoryItems) {
		item.addEventListener('click', event => {
			toggleNav()
			if (event.target.dataset.jumpTarget) { jumpToKey(event.target.dataset.jumpTarget) }			
		})
	}

	fabricator.dom.navToggle.addEventListener('click', toggleNav)
	fabricator.dom.resizeToggle.addEventListener('change', event => {
		if (event.target.checked) activateFullscreenResize()
		else destroyFullscreenResize()
	})
	fabricator.dom.rulerToggle.addEventListener('change', event => {
		if (event.target.checked) activateFullscreenRuler()
		else destroyFullscreenRuler()
	})
}

/**
 * show toast 
 */
const showToast = (text, icon) => {
	let iconContent = ''
	if (icon) {
		iconContent = `
			<svg class="f-icon">
                <use xlink:href="#f-icon-${icon}"" />
            </svg>
		`
	}
	let toastContent = `${iconContent} ${text}`
    document.querySelector(config.selectors.toast).innerHTML = toastContent

	setDataAttribute(config.selectors.toast, 'data-f-state--toast', 'active')

	setTimeout(() => {
		setDataAttribute(config.selectors.toast, 'data-f-state--toast', '')
	}, 1000);
}

/**
 * Initializes Styleguide on DOMContentLoaded Event
 */
const initStyleguide = () => {
	document.addEventListener("DOMContentLoaded", () => {		
		let clipboard = new Clipboard('[data-clipboard-trigger]');
		clipboard.on('success', function(e) {
		    showToast('Copied', 'check')
		})

	    // get URL params
	    let key = getParamByName('detail')
	    if (key && key !== '' && key !== 'null' && key !== 'undefined') activateFullscreenMode(key)

		fabricator.dom.resizeToggle.checked = fullscreenResizeActive
		if (fullscreenResizeActive) activateFullscreenResize()
		fabricator.dom.rulerToggle.checked = fullscreenRulerActive
	
		initProgressNav({
			nav: '.f-nav--progress',
			navMarker: '.nav-marker',
			scrollContainer: '[data-f-jump-container]'
		})
	})
    Prism.hooks.add('before-highlight',  env => {
		var element = env.element
		var code = env.code
		var codeToHide = getFlaggedString(code, '<no-highlight>', '</no-highlight>')
		if (codeToHide.length > 0) env.code = code.replace(codeToHide, '')
	})

    window.Prism.highlightAll()
}

/**
 * Initialization
 */
(function () {
	// invoke
	initStyleguide()
	setInitialMenuState()
	setActiveItem()
	bindEventHandlers()
}())
