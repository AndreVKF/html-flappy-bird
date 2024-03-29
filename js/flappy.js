function novoElemento(tagName, className) {
  const elem = document.createElement(tagName)
  elem.className = className
  return elem
}

function Barreira(superior = false) {
  this.elemento = novoElemento("div", "barreira")

  const borda = novoElemento("div", "borda")
  const corpo = novoElemento("div", "corpo")

  this.elemento.appendChild(superior ? corpo : borda)
  this.elemento.appendChild(superior ? borda : corpo)

  this.setAltura = (altura) => (corpo.style.height = `${altura}px`)
}

// const b = new Barreira(superior=true)
// b.setAltura(300)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function ParDeBarreiras(altura, abertura, x) {
  this.elemento = novoElemento("div", "par-de-barreiras")

  this.superior = new Barreira(true)
  this.inferior = new Barreira(false)

  this.elemento.appendChild(this.superior.elemento)
  this.elemento.appendChild(this.inferior.elemento)

  this.sortearAbertura = () => {
    const alturaSuperior = Math.random() * (altura - abertura)
    const alturaInferior = altura - abertura - alturaSuperior

    this.superior.setAltura(alturaSuperior)
    this.inferior.setAltura(alturaInferior)
  }

  this.getX = () => parseInt(this.elemento.style.left.split("px")[0])
  this.setX = (x) => (this.elemento.style.left = `${x}px`)
  this.getLargura = () => this.elemento.clientWidth

  this.sortearAbertura()
  this.setX(x)
}

// const b = new ParDeBarreiras(700, 200, 400);
// document.querySelector("[wm-flappy]").appendChild(b.elemento);

function Barreiras(
  altura,
  largura,
  abertura,
  espaco,
  notificarPonto,
  nBarreiras = 4
) {
  this.pares = []

  // Creates barreiras
  for (let i = 0; i < nBarreiras; i++) {
    this.pares.push(new ParDeBarreiras(altura, abertura, largura + espaco * i))
  }

  const deslocamento = 3
  this.animar = () => {
    this.pares.forEach((par) => {
      par.setX(par.getX() - deslocamento)

      // quando elemento sair do jogo
      if (par.getX() < -par.getLargura()) {
        par.setX(par.getX() + espaco * this.pares.length)
        par.sortearAbertura()
      }

      const meio = largura / 2
      const cruzouOMeio = par.getX() + deslocamento >= meio && par.getX() < meio

      cruzouOMeio && notificarPonto()
    })
  }
}

function Passaro(alturaDaTela) {
  let voando = false

  this.elemento = novoElemento("img", "passaro")
  this.elemento.src = "imgs/passaro.png"

  this.getY = () => parseInt(this.elemento.style.bottom.split("px")[0])
  this.setY = (y) => (this.elemento.style.bottom = `${y}px`)

  window.onkeydown = (e) => (voando = true)
  window.onkeyup = (e) => (voando = false)

  this.animar = () => {
    const novoY = this.getY() + (voando ? 6 : -4)
    const alturaMaxima = alturaDaTela - this.elemento.clientHeight

    if (novoY <= 0) {
      this.setY(0)
    } else if (novoY >= alturaMaxima) {
      this.setY(alturaMaxima)
    } else {
      this.setY(novoY)
    }
  }

  this.setY(alturaDaTela / 2)
}

function Progresso() {
  this.elemento = novoElemento("span", "progresso")
  this.atualizarPontos = (pontos) => {
    this.elemento.innerHTML = pontos
  }

  this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB) {
  const a = elementoA.getBoundingClientRect()
  const b = elementoB.getBoundingClientRect()

  let aLeft,
    aWidth,
    bLeft,
    bWidth,
    aTop,
    aHeight,
    bTop,
    bHeight = 0
  let horizontal,
    vertical = 0

  aLeft = a.left
  aWidth = a.width
  bLeft = b.left
  bWidth = b.width
  aTop = a.top
  aHeight = a.height
  bTop = b.top
  bHeight = b.height

  horizontal = aLeft + aWidth >= bLeft && bLeft + bWidth >= aLeft
  vertical = aTop + aHeight >= bTop && bTop + bHeight >= aTop

  return horizontal && vertical
}

function colidiu(passaro, barreiras) {
  let colidiu = false

  barreiras.pares.forEach((parDeBarreiras) => {
    if (!colidiu) {
      const superior = parDeBarreiras.superior.elemento
      const inferior = parDeBarreiras.inferior.elemento

      colidiu =
        estaoSobrepostos(passaro.elemento, superior) ||
        estaoSobrepostos(passaro.elemento, inferior)
    }
  })

  return colidiu
}

function FlappyBird() {
  let pontos = 0

  const areaDoJogo = document.querySelector("[wm-flappy]")
  const altura = areaDoJogo.clientHeight
  const largura = areaDoJogo.clientWidth

  const progresso = new Progresso()
  const passaro = new Passaro(altura)
  const barreiras = new Barreiras(altura, largura, 200, 400, () =>
    progresso.atualizarPontos(++pontos)
  )

  areaDoJogo.appendChild(progresso.elemento)
  areaDoJogo.appendChild(passaro.elemento)
  barreiras.pares.forEach((par) => areaDoJogo.appendChild(par.elemento))

  this.start = () => {
    // loop do jogo
    const temporizador = setInterval(() => {
      barreiras.animar()
      passaro.animar()

      if (colidiu(passaro, barreiras)) {
        console.log("colidiu")
        clearInterval(temporizador)
      }
    }, 20)
  }
}

new FlappyBird().start()
