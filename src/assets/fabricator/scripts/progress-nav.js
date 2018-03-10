export const initProgressNav = (options) => {
  var nav = document.querySelector(options.nav)
  var navPath = document.querySelector(`${options.navMarker} path`)
  var navItems

  // Factor of screen size that the element must cross
  // before it's considered visible
  var TOP_MARGIN = 0.2,
      BOTTOM_MARGIN = 0.2

  var pathLength

  window.addEventListener('resize', drawPath, false )

  let container = window
  if (options.scrollContainer) container = document.querySelector(options.scrollContainer)
  container.addEventListener('scroll', sync, false )

  function drawPath() {
    navItems = [].slice.call( nav.querySelectorAll( '.f-link--item' ) )
    // console.log(navItems)
    // Cache element references and measurements
    navItems = navItems.map(item => {
      let target = document.getElementById( item.getAttribute( 'href' ).slice( 1 ) )
      return {
        anchor: item,
        target
      }
    })

    // Remove missing targets
    navItems = navItems.filter(item => !!item.target)

    var path = []
    var pathIndent

    navItems.forEach((item, i) => {
      let x = item.anchor.offsetLeft,
          y = item.anchor.offsetTop,
          height = item.anchor.offsetHeight

      if (i === 0) {
        path.push( 'M', x, y, 'L', x, y + height )
        item.pathStart = 0
      }
      else {
        path.push( 'L', x, y )
        
        // Set the current path so that we can measure it
        navPath.setAttribute( 'd', path.join(' ') )

        item.pathStart = navPath.getTotalLength() || 0
        
        path.push( 'L', x, y + height )
      }
      
      navPath.setAttribute('d', path.join(' '))
      item.pathEnd = navPath.getTotalLength()
    })
    
    pathLength = navPath.getTotalLength()
    sync()
  }

  function sync() {
    var containerHeight = container.getBoundingClientRect() ? container.getBoundingClientRect().height : container.innerHeight
    var pathStart = pathLength,
        pathEnd = 0
    var visibleItems = 0

    let closestItemOffset = 0

    navItems.forEach( function( item ) {
      var targetBounds = item.target.getBoundingClientRect()

      if( targetBounds.bottom > containerHeight * TOP_MARGIN && targetBounds.top < containerHeight * ( 1 - BOTTOM_MARGIN ) ) {
        let itemBottomVisibilityArea = targetBounds.bottom - containerHeight * TOP_MARGIN
        let itemTopVisibilityArea = containerHeight * ( 1 - BOTTOM_MARGIN ) - targetBounds.top

        pathStart = Math.min( item.pathStart, pathStart )
        pathEnd = Math.max( item.pathEnd, pathEnd )


        // console.log(item.target.id, targetBounds.bottom - containerHeight * TOP_MARGIN < closestItemOffset)
        
        visibleItems += 1
        item.anchor.classList.add('visible')
        // if (targetBounds.bottom - containerHeight * TOP_MARGIN < closestItemOffset) item.anchor.classList.add('visible')

        closestItemOffset = targetBounds.bottom - containerHeight * TOP_MARGIN
      }
      else {
        item.anchor.classList.remove('visible')
      }
      
    } )
    
    // Specify the visible path or hide the path altogether
    // if there are no visible items
    if( visibleItems > 0 && pathStart < pathEnd ) {
      navPath.setAttribute('stroke-dashoffset', '1')
      navPath.setAttribute('stroke-dasharray', `1, ${pathStart}, ${pathEnd - pathStart}, ${pathLength}`)
      navPath.setAttribute('opacity', 1)
    }
    else {
      navPath.setAttribute('opacity', 0)
    }
  }

  drawPath()
}