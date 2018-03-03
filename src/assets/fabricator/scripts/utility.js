export const getParamByName = (name, url) => {
    if (!url) url = window.location.href
    name = name.replace(/[\[\]]/g, "\\$&")
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, " "))
}

export const addParam = (key, value) => {
    //Get query string value
	let searchUrl=location.search
	let urlValue = ''
	if (searchUrl.indexOf("?") == "-1") {
		urlValue = '?' + key + '=' + value
		history.pushState({state:1, rand: Math.random()}, '', urlValue)
	}
	else {
		//Check for key in query string, if not present
		if(searchUrl.indexOf(key)== "-1") {
			urlValue = searchUrl + '&' + key + '=' + value
		}
		else {	//If key present in query string
			let oldValue = getParamByName(key)
			urlValue = searchUrl.indexOf("?" + key + "=") != "-1" 
				? searchUrl.replace('?' + key + '=' + oldValue,'?' + key + '=' + value) 
				: urlValue = searchUrl.replace('&' + key + '=' + oldValue,'&' + key + '=' + value)
		}
		history.pushState({state:1, rand: Math.random()}, '', urlValue)
		//history.pushState function is used to add history state.
		//It takes three parameters: a state object, a title (which is currently ignored), and (optionally) a URL.
	}
}

export const removeParam = (key) => {
	let urlValue=document.location.href

	//Get query string value
	let searchUrl=location.search

	if(key!="") {
		let oldValue = getParamByName(key)
		let removeVal=key+"="+oldValue
		if(searchUrl.indexOf('?'+removeVal+'&')!= "-1") {
			urlValue=urlValue.replace('?'+removeVal+'&','?')
		}
		else if(searchUrl.indexOf('&'+removeVal+'&')!= "-1") {
			urlValue=urlValue.replace('&'+removeVal+'&','&')
		}
		else if(searchUrl.indexOf('?'+removeVal)!= "-1") {
			urlValue=urlValue.replace('?'+removeVal,'')
		}
		else if(searchUrl.indexOf('&'+removeVal)!= "-1") {
			urlValue=urlValue.replace('&'+removeVal,'')
		}
	}
	else {
		let searchUrl=location.search
		urlValue=urlValue.replace(searchUrl,'')
	}
	history.pushState({state:1, rand: Math.random()}, '', urlValue)
}

export const getFlaggedString = (string, startFlag, endFlag) => {
	let flaggedString = ''
	let index = string.indexOf(startFlag)
	if (index > -1) {
		let start = index
		let end = string.indexOf(endFlag)

		if (end > -1 && end > start) {
			flaggedString = string.substr(start, end - start + endFlag.length)
		}
	}
	return flaggedString
}

export const toggleDataAttribute = (selector, name, stateA, stateB) => {
  let element = document.querySelector(selector)
  element.setAttribute(name, element.getAttribute(name) === stateA ? stateB : stateA)
}

export const setDataAttribute = (selector, key, value) => {
  let element = document.querySelector(selector)
  element.setAttribute(key, value)
}