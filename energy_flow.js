(() => {
  Object.prototype.energyFlow = function (opt) {

    let _this = this.length > 0 ? [...this] : [this]
    let defaultOptions = {
      particles: 250,
      duration: 5,
      jiggle: 5,
      size: { 'width': 2000, 'height': 300 },
      colors: ['#0E80C0', '#53C1B0', '#52A6DD'],
      waves: true
    }

    let options = Object.assign(defaultOptions, opt)
    options.flowRange = .7
    options.particleSize = 20


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
      return randomInterval(range / 2 - options.particleSize / 2,
        options.size.height - range / 2 - options.particleSize / 2)
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
      let wavesPaths
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

      wavesPaths = document.createElementNS('http://www.w3.org/2000/svg',
        'g')
      wavesPaths.setAttribute('id', 'wavesPaths')

      hexagonsContainer = document.createElementNS('http://www.w3.org/2000/svg',
        'g')
      hexagonsContainer.setAttribute('id', 'hexagons')

      defsContainer = document.createElementNS('http://www.w3.org/2000/svg',
        'defs')

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
        svg#energy-flow path,
        svg#energy-flow #waves use
         { 
          transform-box: fill-box; transform-origin: center;
        }
        svg#energy-flow #waves {
          filter: drop-shadow( 0 0 5px rgba(255 255 255 / 80%))
        }
        `
      defsContainer.appendChild(styleContainer)
      defsContainer.appendChild(wavesPaths)


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
    let drawLine = container => {
      let line = createPowerLine()
      container.querySelector('#line').appendChild(line)
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

      path.setAttribute('d',
        'M10 5 L14.3301 7.5 V12.5 L10 15 L5.66987 12.5 V7.5 L10 5Z')

      path.setAttribute('style', 'scale: ' + scale + ';')
      path.setAttribute('fill', '#fff')
      path.setAttribute('fill-opacity', '0.3')
      return path
    }
    let createSymbol = (i, scale) => {
      let symbol = document.createElementNS('http://www.w3.org/2000/svg',
        'symbol')
      symbol.setAttribute('id', 'symbol_' + i)
      symbol.setAttribute('viewBox', `0 0 ${options.particleSize} ${options.particleSize}`)
      symbol.setAttribute('with', options.particleSize)
      symbol.setAttribute('height', options.particleSize)

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
    let createFlow = (count, duration) => {
      let speed = options.size.width / duration
      let fastParticles = count * 0.05

      return Array(count).fill({}).map((el, i) => {
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
    }
    let drawFlow = (container, hexagons) => {
      container.querySelector('#symbols').innerHTML = ''
      container.querySelector('#hexagons').innerHTML = ''
      hexagons.map((el) => {
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
    
    let createCurvature = (curvesCount) => {
      let numberOfParts = 4
      let x = 0
      
      let chunk = options.size.width / curvesCount / numberOfParts
      let range = 1-options.flowRange
      let minY = (options.size.height - options.size.height*range)/2
      let maxY = options.size.height - minY

      let middle = options.size.height / 2
      let curMinY = randomInterval(minY, middle*0.95)
      let curMaxY = randomInterval(middle*1.05, maxY)

      let curve = `M ${x},${curMinY} C `
      let curveArr = []
      for(let i=0;i<curvesCount;i++) {
        curveArr.push( `${x += chunk},${curMinY}` )
        curMinY = randomInterval(minY, middle*0.95)
        curMaxY = randomInterval(middle*1.05, maxY)
        curveArr.push( `${x},${curMaxY}` )
        curveArr.push( `${x += chunk},${curMaxY}` )

        curveArr.push( `${x += chunk},${curMaxY}` )
        curveArr.push( `${x},${curMinY}` )
        curveArr.push( `${x += chunk},${curMinY}` )
      }
      curve += curveArr.join(' ')
      return curve
    }
    let createWaves = (count) => {
      return Array(count).fill({}).map((el, i) => {
        el = {}
        el.tag = document.createElementNS('http://www.w3.org/2000/svg', 'path')

        let wavesOnScreen = Math.ceil((options.size.width / options.size.height) / 2 )
        let curve = createCurvature(wavesOnScreen)
        el.width = options.size.width
        el.tag.setAttribute('d',curve)

        el.tag.setAttribute('id', 'wave_'+i)
        el.tag.setAttribute('fill', 'none')
        el.tag.setAttribute('stroke-width', '2')
        el.tag.setAttribute('stroke-opacity', '.7')

        return el
      })
    }
    let drawWaves = (container, waves) => {
      container.querySelector('#waves').innerHTML = ''
      container.querySelector('#wavesPaths').innerHTML = ''
      waves.map((el, i) => {
        container.querySelector('#wavesPaths').appendChild(el.tag)

        let use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
        use.setAttribute('href', '#wave_'+i)
        use.setAttribute('stroke', options.colors[i])
        container.querySelector('#waves').appendChild(use)

        let useReversed = document.createElementNS('http://www.w3.org/2000/svg', 'use')
        useReversed.setAttribute('href', '#wave_'+i)
        useReversed.setAttribute('class', 'reversed')
        useReversed.setAttribute('stroke', options.colors[i])
        container.querySelector('#waves').appendChild(useReversed)
      })
    }
    let animateWaves = (container, waves) => {
      let style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
      waves.map((el, i) => {
        let duration = options.duration
        duration *= (100-(i+1)*10)/100
        style.innerHTML += `
          #wave_${i} {
            transform: translateY(${randomInterval(-10,10)}px);
          }
          
          [href='#wave_${i}'] {
            animation: waveStart_${i} ${duration}s linear, wave_${i} ${duration*2}s ${duration}s linear infinite;
          }
          @keyframes waveStart_${i}{
          /*
            0% {
              stroke-dasharray: 0 2000;
              stroke-dashoffset: 0;
              translate: 0
            }
            100% {
              stroke-dasharray: 2000 0;
              stroke-dashoffset: 3000;
              translate: ${el.width}px
            }
            */
            0% {
              stroke-dasharray: 0 10000;
              translate: 0
            }
            100% {
              stroke-dasharray: 2000 10000;
              translate: ${el.width}px
            }
          }
          @keyframes wave_${i}{
            0% {
              translate: -${el.width}px
            }
            100% {
              translate: ${el.width}px
            }
          }
          
          [href='#wave_${i}'].reversed {
            transform: rotateY(180deg);
            animation: wave_reversed_${i} ${duration*2}s linear infinite;
          }
          @keyframes wave_reversed_${i}{
            0% {
              translate: -${el.width}px
            }
            100% {
              translate: ${el.width}px
            }
          }
        `
      })
      container.querySelector('defs').appendChild(style)
    }

    let startFlow = () => {
      _this.map((container) => {
        createSvg(container)
        drawLine(container)

        let waves = createWaves(options.colors.length)
        drawWaves(container,waves)
        animateWaves(container,waves)

        let hexagons = createFlow(options.particles, options.duration)
        drawFlow(container, hexagons)
        animateFlow(hexagons)
      })
    }

    startFlow()
  }
})()