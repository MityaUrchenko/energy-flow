(() => {
  Object.prototype.energyFlow = function (opt) {

    let _this = this.length > 0 ? [...this] : [this]
    let defaultOptions = {
      particles: 250,
      duration: 5,
      jiggle: 5,
      size: { 'width': 2000, 'height': 300 },
      colors: ['#0E80C0', '#53C1B0', '#52A6DD'],
    }

    let options = Object.assign(defaultOptions, opt)
    options.flowRange = .7

    let randomInterval = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1) + min)
    }

    let getRandomXcoordinate = (scale) => {
      return randomInterval(options.size.width / 2 * -1,
        options.size.width / 2)
    }

    let getRandomYcoordinate = (scale) => {
      let range = options.size.height -
        (options.size.height * options.flowRange * scale)
      return randomInterval(range / 2 - 10,
        options.size.height - range / 2 - 10)
    }

    let valueRangeToRange = (value, rangeIn, rangeOut) => {
      return rangeOut[0] + (rangeOut[1] - rangeOut[0]) * (value - rangeIn[0]) /
        (rangeIn[1] - rangeIn[0])
    }

    let createSvg = (container) => {
      container.innerHTML = ''
      container.style.width = '100%'
      container.style.lineHeight = '0'

      let svgContainer
      let lineContainer
      let wavesContainer
      let hexagonsContainer
      let defsContainer
      let symbolsContainer
      let styleContainer

      svgContainer = document.createElementNS('http://www.w3.org/2000/svg',
        'svg')
      svgContainer.setAttribute('viewBox',
        `0 0 ${options.size.width} ${options.size.height}`)
      svgContainer.setAttribute('id', 'energy-flow')
      svgContainer.setAttribute('fill', 'none')

      lineContainer = document.createElementNS('http://www.w3.org/2000/svg',
        'g')
      lineContainer.setAttribute('id', 'line')

      wavesContainer = document.createElementNS('http://www.w3.org/2000/svg',
        'g')
      wavesContainer.setAttribute('id', 'waves')

      hexagonsContainer = document.createElementNS('http://www.w3.org/2000/svg',
        'g')
      hexagonsContainer.setAttribute('id', 'hexagons')

      defsContainer = document.createElementNS('http://www.w3.org/2000/svg',
        'defs')
      defsContainer.setAttribute('id', 'defs')

      symbolsContainer = document.createElementNS('http://www.w3.org/2000/svg',
        'g')
      symbolsContainer.setAttribute('id', 'symbols')
      defsContainer.appendChild(symbolsContainer)

      styleContainer = document.createElement('style')
      styleContainer.innerHTML = `
        svg#energy-flow { 
          filter: drop-shadow( 0 0 5px rgba(255 255 255 / 20%) );
        }
        svg#energy-flow #hexagons { 
          filter: drop-shadow( 0 0 5px rgba(255 255 255 / 60%))
        }
        svg#energy-flow symbol path { 
          transform-box: fill-box; transform-origin: center;
        }
        `
      defsContainer.appendChild(styleContainer)

      svgContainer.appendChild(defsContainer)
      svgContainer.appendChild(lineContainer)
      svgContainer.appendChild(wavesContainer)
      svgContainer.appendChild(hexagonsContainer)
      container.appendChild(svgContainer)
    }

    let createPowerLine = () => {
      let path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d',
        `M-${options.size.width * 0.05} ${options.size.height /
        2} L${options.size.width * 1.05} ${options.size.height / 2}`)
      path.setAttribute('stroke', options.colors[0])
      path.setAttribute('style', `filter: blur(${options.size.height / 12}px)`)
      path.setAttribute('stroke-width', `${options.size.height / 15}`)
      path.setAttribute('stroke-opacity', '.7')
      return path
    }

    let createHex = (i, scale) => {
      let path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d',
        'M10 0 L18.6603 5 V15 L10 20 L1.33975 15 V5 L10 0Z')

      let color = options.colors[randomInterval(0,
        options.colors.length - 1)]
      path.setAttribute('style', 'scale: ' + scale + ';')
      path.setAttribute('fill', color)
      path.setAttribute('fill-opacity', Math.pow(scale, 2) * 0.8)
      return path
    }

    let createHexInner = (i, scale) => {
      let path = document.createElementNS('http://www.w3.org/2000/svg', 'path')

      //hexagon
      path.setAttribute('d',
        'M10 5 L14.3301 7.5 V12.5 L10 15 L5.66987 12.5 V7.5 L10 5Z')

      //star
      //path.setAttribute('d', 'M10 2L11.1314 8.86863L18 10L11.1314 11.1314L10
      // 18L8.86863 11.1314L2 10L8.86863 8.86863L10 2Z')

      path.setAttribute('style', 'scale: ' + scale + ';')
      path.setAttribute('fill', '#fff')
      path.setAttribute('fill-opacity', '0.3')
      return path
    }

    let createSymbol = (i, scale) => {
      let symbol = document.createElementNS('http://www.w3.org/2000/svg',
        'symbol')
      symbol.setAttribute('id', 'symbol_' + i)
      symbol.setAttribute('viewBox', '0 0 20 20')
      symbol.setAttribute('with', '20')
      symbol.setAttribute('height', '20')

      let hex = createHex(i, scale)
      let hexInner = createHexInner(i, scale)
      symbol.appendChild(hex)
      symbol.appendChild(hexInner)
      return symbol
    }

    let createParticle = (i) => {
      let hexagon = document.createElementNS('http://www.w3.org/2000/svg',
        'use')

      hexagon.setAttribute('x', '0')
      hexagon.setAttribute('y', '0')
      hexagon.setAttribute('id', 'hex' + i)
      hexagon.setAttribute('href', '#symbol_' + i)
      return hexagon
    }

    let createLine = (container) => {
      let line = createPowerLine()
      container.querySelector('#line').appendChild(line)
    }

    let createFlow = (count, duration) => {
      let speed = options.size.width / duration
      let fastParticles = count * 0.05

      let hexagons = Array(count).fill({}).map((el, i) => {
        let scaleValues

        if (i < count * .7) {
          scaleValues = [50, 70]
        }
        else if (i < count * .9) {
          scaleValues = [70, 80]
        }
        else {
          scaleValues = [95, 105]
        }

        /*
          //геометрическая прогрессия масштаба
          scaleValues[0] = valueRangeToRange(Math.pow(i, 2),
            [0, Math.pow(count - 1, 2)], [50, 100])
          scaleValues[1] = valueRangeToRange(Math.pow(i, 2),
            [0, Math.pow(count - 1, 2)], [70, 105])
        */

        let scale = randomInterval(scaleValues[0], scaleValues[1]) / 100
        el = {
          tag: createParticle(i),
          symbol: createSymbol(i, scale),
          dir: 0,
          scale: scale,
          fluctuations: Math.random(),
          speed: randomInterval(speed, speed * 1.10) / 100 * scale,
          x: getRandomXcoordinate(scale),
          y: getRandomYcoordinate(scale),
          charge: 1,
        }
        el.tag.setAttribute('x', el.x)
        el.tag.setAttribute('y', el.y)

        if (i < fastParticles) {
          el.x = randomInterval(options.size.width * -2,
            options.size.width * 2)
          el.charge = randomInterval(300, 350) / 100
        }
        el.jiggle = el.speed * el.charge * (el.scale / (100 / options.jiggle))

        return el
      })
      return hexagons
    }
    let drawFlow = (container, hexagons) => {
      container.querySelector('#symbols').innerHTML = ''
      container.querySelector('#hexagons').innerHTML = ''
      hexagons.map((el, i) => {
        container.querySelector('#symbols').appendChild(el.symbol)
        container.querySelector('#hexagons').appendChild(el.tag)
      })
    }

    let animateFlow = (hexagons) => {
      requestAnimationFrame(render)

      function render (t) {
        requestAnimationFrame(render)
        hexagons.map((el, i) => {

          let speed = el.speed
          if (el.charge > 1) {
            speed *= el.charge
          }
          el.x += speed

          let templateWidth = options.size.width / 2
          if (el.charge > 1) {
            templateWidth = options.size.width * 2
          }

          if (el.x > templateWidth + 10) {
            el.x *= -1
            el.y = getRandomYcoordinate(el.scale)
          }
          if (options.jiggle) {
            el.y += ((Math.random() < 0.5) ? -1 : 1) * el.jiggle
          }

          el.tag.setAttribute('x', el.x)
          el.tag.setAttribute('y', el.y)
        })
      }
    }

    let startFlow = (opt) => {
      opt = Object.assign(options, opt)
      _this.map((container) => {
        createSvg(container)
        createLine(container)
        let hexagons = createFlow(opt.particles, opt.duration)
        drawFlow(container, hexagons)
        animateFlow(hexagons)
      })
    }

    startFlow(options)
  }
})()