const cubicDiv = document.getElementById(`cubicDiv`)

const G = 'G'
const Y = 'Y'
const W = 'W'
const O = 'O'
const B = 'B'
const R = 'R'

let n = 3
let sides = []
let matrices = []
let currentHash = 'WBOGRY'

/* Multiplied by 10 */
const trans = {
  x: 450,
  y: 0,
  z: 1350
}

let draggable = null
let rotating = null

let isMenuOpen = false
let isPaletteOpen = false
let paletteColor = null
let paletteColorBtn = null

function addSide(s) {
  const side = document.createElement('div')
  side.id = `side${s}`
  side.classList.add('side')
  side.dataset.s = s
  for (let i = 0; i < n; i++) {
    const row = document.createElement('div')
    row.classList.add('row')
    row.dataset.row = i
    row.dataset.side = s
    for (let j = 0; j < n; j++) {
      const cell = document.createElement('div')
      cell.classList.add('cell')
      cell.dataset.cell = j
      cell.dataset.row = i
      cell.dataset.side = s
      row.appendChild(cell)
    }
    side.appendChild(row)
  }
  return side
}

function initCubes(newN) {
  n = newN
  cubicDiv.innerHTML = ''

  cubicDiv.appendChild(addSide('0'))
  cubicDiv.appendChild(addSide('1'))
  cubicDiv.appendChild(addSide('2'))

  cubicDiv.appendChild(addSide('3'))
  cubicDiv.appendChild(addSide('4'))
  cubicDiv.appendChild(addSide('5'))

  matrices = [getMatrix(W), getMatrix(B), getMatrix(O), getMatrix(G), getMatrix(R), getMatrix(Y)]

  currentHash = toHash(matrices)

  sides = [...Array(6)].map((_, i) => document.getElementById(`side${i}`))

  drawCube(matrices)
}

initCubes(n)


/*
         ╱╲
       ╱    ╲
      ╱       ╲
4->  |╲  0    ╱|
    |   ╲   ╱  |  <-3
   |  1  ╲╱ 2  |
    ╲    |    ╱
      ╲  |  ╱
  5->   ╲|╱

 */

const hashTable = {
  [toHash(matrices)]: -1
}

function toHash(mat) {
  return mat.map(side =>
    side.map(row =>
      row.join('')
    ).join('')
  ).join('')
}

function fromHash(hash) {
  const mat = [getMatrix(W), getMatrix(B), getMatrix(O), getMatrix(G), getMatrix(R), getMatrix(Y)]
  for (let i = 0; i < hash.length; i++) {
    const side = Math.trunc(i / (n * n))
    const rest = i % (n * n)
    const row = Math.trunc(rest / n)
    const cell = rest % n
    mat[side][row][cell] = hash[i]
  }
  return mat
}

function getRow(color) {
  return [...Array(n)].map(a => color)
}

function getMatrix(color) {
  return [...Array(n)].map(a => getRow(color))
}


function fillSide(matrix, side) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const c = matrix[i][j]
      side.children[i].children[j].setAttribute('color', c)
    }
  }
}

function copyRow(row) {
  return [...row]
}

function copySide(side) {
  return side.map(copyRow)
}

function copyMatrix(mat) {
  return mat.map(copySide)
}

function moveRow(rowFrom, rowTo) {
  for (let i = 0; i < n; i++) {
    rowTo[i] = rowFrom[i]
  }
}

function moveLeft(row, matrix) {
  const tempSide = copySide(matrix[1])
  for (let i = 1; i < 4; i++) {
    moveRow(matrix[i + 1][row], matrix[i][row])
  }
  moveRow(tempSide[row], matrix[4][row])
  if (row === 0) {
    moveSideCounterClockwise(matrix[0])
  }
  if (row === n - 1) {
    moveSideClockwise(matrix[5])
  }
}


function moveRight(row, matrix) {
  const tempSide = copySide(matrix[4])
  for (let i = 4; i >= 2; i--) {
    moveRow(matrix[i - 1][row], matrix[i][row])
  }
  moveRow(tempSide[row], matrix[1][row])
  if (row === 0) {
    moveSideClockwise(matrix[0])
  }
  if (row === n - 1) {
    moveSideCounterClockwise(matrix[5])
  }
}

function moveSideClockwise(side) {
  const oldSide = copySide(side)
  for (let offset = 0; offset * 2 < n - 1; offset++) {
    for (let i = offset; i < n - 1 - offset; i++) {
      side[offset][i] = oldSide[i][n - 1 - offset]
      side[i][n - 1 - offset] = oldSide[n - 1 - offset][n - 1 - i]
      side[n - 1 - offset][n - 1 - i] = oldSide[n - 1 - i][offset]
      side[n - 1 - i][offset] = oldSide[offset][i]
    }
  }
}

function moveSideCounterClockwise(side) {
  const oldSide = copySide(side)
  for (let offset = 0; offset * 2 < n - 1; offset++) {
    for (let i = offset; i < n - 1 - offset; i++) {
      side[offset][i] = oldSide[n - 1 - i][offset]
      side[n - 1 - i][offset] = oldSide[n - 1 - offset][n - 1 - i]
      side[n - 1 - offset][n - 1 - i] = oldSide[i][n - 1 - offset]
      side[i][n - 1 - offset] = oldSide[offset][i]
    }
  }
}


function moveLeftUp(col, matrix) {
  const tempSide = copySide(matrix[2])
  for (let i = 0; i < n; i++) {
    matrix[2][i][col] = matrix[5][n - 1 - i][n - 1 - col]
  }
  for (let i = 0; i < n; i++) {
    matrix[5][i][n - 1 - col] = matrix[4][i][n - 1 - col]
  }
  for (let i = 0; i < n; i++) {
    matrix[4][i][n - 1 - col] = matrix[0][n - 1 - col][n - 1 - i]
  }
  for (let i = 0; i < n; i++) {
    matrix[0][n - 1 - col][i] = tempSide[i][col]
  }
  if (col === 0) {
    moveSideClockwise(matrix[1])
  }
  if (col === n - 1) {
    moveSideCounterClockwise(matrix[3])
  }
}

function moveLeftDown(col, matrix) {
  const tempSide = copySide(matrix[1])
  for (let i = 0; i < n; i++) {
    matrix[1][i][col] = matrix[0][i][col]
  }
  for (let i = 0; i < n; i++) {
    matrix[0][i][col] = matrix[3][n - 1 - i][n - 1 - col]
  }
  for (let i = 0; i < n; i++) {
    matrix[3][i][n - 1 - col] = matrix[5][col][i]
  }
  for (let i = 0; i < n; i++) {
    matrix[5][col][n - 1 - i] = tempSide[i][col]
  }
  if (col === 0) {
    moveSideCounterClockwise(matrix[4])
  }
  if (col === n - 1) {
    moveSideClockwise(matrix[2])
  }
}

function moveRightUp(col, matrix) {
  const tempSide = copySide(matrix[1])
  for (let i = 0; i < n; i++) {
    matrix[1][i][col] = matrix[5][col][n - 1 - i]
  }
  for (let i = 0; i < n; i++) {
    matrix[5][col][i] = matrix[3][i][n - 1 - col]
  }
  for (let i = 0; i < n; i++) {
    matrix[3][n - 1 - i][n - 1 - col] = matrix[0][i][col]
  }
  for (let i = 0; i < n; i++) {
    matrix[0][i][col] = tempSide[i][col]
  }

  if (col === 0) {
    moveSideClockwise(matrix[4])
  }
  if (col === n - 1) {
    moveSideCounterClockwise(matrix[2])
  }
}

function moveRightDown(col, matrix) {
  const tempSide = copySide(matrix[2])
  for (let i = 0; i < n; i++) {
    matrix[2][i][col] = matrix[0][n - 1 - col][i]
  }
  for (let i = 0; i < n; i++) {
    matrix[0][n - 1 - col][n - 1 - i] = matrix[4][i][n - 1 - col]
  }
  for (let i = 0; i < n; i++) {
    matrix[4][i][n - 1 - col] = matrix[5][i][n - 1 - col]
  }
  for (let i = 0; i < n; i++) {
    matrix[5][n - 1 - i][n - 1 - col] = tempSide[i][col]
  }
  if (col === 0) {
    moveSideCounterClockwise(matrix[1])
  }
  if (col === n - 1) {
    moveSideClockwise(matrix[3])
  }
}

function drawCube(matrix) {
  for (let i = 0; i < 6; i++) {
    fillSide(matrix[i], sides[i])
  }
}


document.getElementById(`resetBtn`).addEventListener('click', (e) => {
  if (Number(rowSize.value) > 200) {
    rowSize.value = '20'
  }
  initCubes(Number(rowSize.value))
})

document.getElementById(`randomizeBtn`).addEventListener('click', (e) => {
  for (let i = 0; i < Number(randomizeDepth.value); i++) {
    randomMove(matrices)
  }
  drawCube(matrices)
})

function randomMove(matrix) {
  const r1 = Math.trunc(Math.random() * 6)
  const r2 = Math.trunc(Math.random() * n)
  if (r1 === 0) {
    moveLeft(r2, matrix)
  } else if (r1 === 1) {
    moveRight(r2, matrix)
  } else if (r1 === 2) {
    moveLeftUp(r2, matrix)
  } else if (r1 === 3) {
    moveLeftDown(r2, matrix)
  } else if (r1 === 4) {
    moveRightUp(r2, matrix)
  } else if (r1 === 5) {
    moveRightUp(r2, matrix)
  }
}

document.body.addEventListener('mousedown', mouseDown)
document.body.addEventListener('touchstart', mouseDown)

function mouseDown(e) {
  if (draggable) {
    draggable.target.classList.remove('dragging')
    draggable = null
  }

  if (!e.target.classList.contains('cell')) {
    if (e.target.id === 'cubicDiv' || e.target.tagName === 'body' || e.target.id === 'relative') {
      rotating = {
        x: e.clientX || e.changedTouches[0].clientX,
        y: e.clientY || e.changedTouches[0].clientY,
        Xspeed: 0,
        Yspeed: 0
      }
    }
    return
  }

  const {side, row, cell} = e.target.dataset

  draggable = {
    side: Number(side),
    row: Number(row),
    cell: Number(cell),
    x: e.clientX || e.changedTouches[0].clientX,
    y: e.clientY || e.changedTouches[0].clientY,
    target: e.target
  }
  e.target.classList.add('dragging')

  console.log(draggable)
}

document.body.addEventListener('mousemove', mouseMove)
document.body.addEventListener('touchmove', mouseMove)

function mouseMove(e) {
  if (rotating) {
    let diffX
    let diffY
    if (e) {
      const x = e.pageX || e.changedTouches[0].pageX
      const y = e.pageY || e.changedTouches[0].pageY
      diffX = x - rotating.x
      diffY = y - rotating.y
      rotating.x = x
      rotating.y = y
      rotating.Xspeed = diffX
      rotating.Yspeed = diffY
    } else {
      diffX = rotating.Xspeed
      diffY = rotating.Yspeed
    }

    trans.x = Math.trunc(3600 + trans.x - diffY * 5) % 3600
    trans.z = Math.trunc(3600 + trans.z - diffX * 4 * Math.sign(Math.sin(trans.x / 5 / 360 * Math.PI))) % 3600

    applyTr()
  }
}

document.body.addEventListener('mouseup', mouseUp)
document.body.addEventListener('touchend', mouseUp)

function mouseUp(e) {

  if (rotating) {
    continueRotating()
  }

  if (draggable == null) {
    return
  }

  const eX2 = e.clientX || e.changedTouches[0].clientX
  const eX1 = draggable.x
  const eY2 = e.clientY || e.changedTouches[0].clientY
  const eY1 = draggable.y
  const shiftX = eX2 - eX1
  const shiftY = eY2 - eY1
  const absShiftX = Math.abs(shiftX)
  const absShiftY = Math.abs(shiftY)
  draggable.target.classList.remove('dragging')

  if (e.target.classList.contains('cell')) {
    const side = Number(e.target.dataset.side)
    const row = Number(e.target.dataset.row)
    const cell = Number(e.target.dataset.cell)
    if (e.changedTouches == null && (side === draggable.side && row === draggable.row && cell === draggable.cell)
      || e.changedTouches && (absShiftX < 20) && (absShiftY < 20)) {
      if (paletteColor !== null) {
        matrices[side][row][cell] = paletteColor
        drawCube(matrices)
      }
      return
    }
  }

  const shiftAngle = Math.atan2(shiftX, shiftY) + Math.PI;
  const row = draggable.target.parentNode
  const side = row.parentNode
  const hCoords1 = row.children[0].getBoundingClientRect();
  const hCoords2 = row.children[1].getBoundingClientRect();
  const vCoords1 = side.children[0].getBoundingClientRect();
  const vCoords2 = side.children[1].getBoundingClientRect();
  const hCellShiftX = hCoords1.x - hCoords2.x
  const hCellShiftY = hCoords1.y - hCoords2.y
  const vCellShiftX = vCoords1.x - vCoords2.x
  const vCellShiftY = vCoords1.y - vCoords2.y
  const cellsAngle = Math.atan2(hCellShiftX, hCellShiftY) + Math.PI;

  const hDiffAngle = Math.acos((shiftX * hCellShiftX + shiftY * hCellShiftY) / (Math.sqrt(shiftX * shiftX + shiftY * shiftY) * Math.sqrt(hCellShiftX * hCellShiftX + hCellShiftY * hCellShiftY)))
  const vDiffAngle = Math.acos((shiftX * vCellShiftX + shiftY * vCellShiftY) / (Math.sqrt(shiftX * shiftX + shiftY * shiftY) * Math.sqrt(vCellShiftX * vCellShiftX + vCellShiftY * vCellShiftY)))
  console.log(shiftAngle, cellsAngle, hDiffAngle, vDiffAngle)

  const isLeft = hDiffAngle < Math.PI / 5
  const isRight = hDiffAngle > Math.PI * 10 / 11
  const isUp = vDiffAngle < Math.PI / 5
  const isDown = vDiffAngle > Math.PI * 10 / 11
  makeMove(isLeft, isRight, isUp, isDown)

  draggable = null

  drawCube(matrices)
}

function continueRotating() {
  if (false && (rotating.Xspeed > 0 || rotating.Yspeed > 0)) {
    if (rotating.Xspeed > 9) {
      rotating.Xspeed = 9
    }
    if (rotating.Yspeed > 7) {
      rotating.Yspeed = 7
    }
    if (rotating.Xspeed > 0) {
      rotating.Xspeed -= 1
    }
    if (rotating.Yspeed > 0) {
      rotating.Yspeed -= 1
    }
    mouseMove()
    setTimeout(continueRotating, 10)
  } else {
    rotating = null
  }
}

function makeMove(isLeft, isRight, isUp, isDown) {
  if (draggable.side === 1) {
    if (isUp) {
      return moveRightUp(draggable.cell, matrices)
    }
    if (isDown) {
      return moveLeftDown(draggable.cell, matrices)
    }
  }

  if (draggable.side === 3) {
    if (isUp) {
      return moveLeftDown(n - 1 - draggable.cell, matrices)
    }
    if (isDown) {
      return moveRightUp(n - 1 - draggable.cell, matrices)
    }
  }

  if (draggable.side === 2) {
    if (isUp) {
      return moveLeftUp(draggable.cell, matrices)
    }
    if (isDown) {
      return moveRightDown(draggable.cell, matrices)
    }
  }

  if (draggable.side === 4) {
    if (isUp) {
      return moveRightDown(n - 1 - draggable.cell, matrices)
    }
    if (isDown) {
      return moveLeftUp(n - 1 - draggable.cell, matrices)
    }
  }

  if (draggable.side === 1 || draggable.side === 2 || draggable.side === 3 || draggable.side === 4) {
    if (isLeft) {
      return moveLeft(draggable.row, matrices)
    }
    if (isRight) {
      return moveRight(draggable.row, matrices)
    }

  }

  if (draggable.side === 0) {
    if (isLeft) {
      return moveLeftUp(n - 1 - draggable.row, matrices)
    }
    if (isRight) {
      return moveRightDown(n - 1 - draggable.row, matrices)
    }
    if (isUp) {
      return moveRightUp(draggable.cell, matrices)
    }
    if (isDown) {
      return moveLeftDown(draggable.cell, matrices)
    }
  }

  if (draggable.side === 5) {
    if (isLeft) {
      return moveLeftDown(draggable.row, matrices)
    }
    if (isRight) {
      return moveRightUp(draggable.row, matrices)
    }
    if (isUp) {
      return moveRightDown(n - 1 - draggable.cell, matrices)
    }
    if (isDown) {
      return moveLeftUp(n - 1 - draggable.cell, matrices)
    }
  }
}

document.body.ondragstart = function () {
  return false;
};

function getCoords(elem) {
  const box = elem.getBoundingClientRect();
  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  };
}

document.getElementById('menuBtn').onclick = function () {
  isMenuOpen = !isMenuOpen
  isPaletteOpen = false
  document.getElementById('menu').classList.toggle('show')
  document.getElementById('palette').classList.remove('show')
  if (paletteColorBtn) paletteColorBtn.classList.remove('selected')
  paletteColorBtn = null
  paletteColor = null
}


document.getElementById('paletteBtn').onclick = function () {
  isMenuOpen = false
  isPaletteOpen = !isPaletteOpen
  document.getElementById('menu').classList.remove('show')
  document.getElementById('palette').classList.toggle('show')
  if (paletteColorBtn) paletteColorBtn.classList.remove('selected')
  paletteColorBtn = null
  paletteColor = null
}

document.getElementById('palette').addEventListener('click', function (e) {
  if (e.target && e.target.classList.contains('colorBtn')) {
    const color = e.target.getAttribute('color')
    if (color === paletteColor) {
      paletteColor = null
      if (paletteColorBtn) paletteColorBtn.classList.remove('selected')
      paletteColorBtn = null
    } else {
      if (paletteColorBtn) paletteColorBtn.classList.remove('selected')
      paletteColorBtn = e.target
      if (paletteColorBtn) paletteColorBtn.classList.add('selected')
      paletteColor = color
    }
  }
})

function solveInner(depth, matrix) {
  const hash = toHash(matrix)
  const hashFound = hashTable[hash]
  if (hashFound !== undefined) {
    if (hashFound === -1) {
      console.log(depth + ' found ' + hash)
      throw Error('Solved')
    }
    // console.log('skip hash ' + hash)
    return
  }
  hashTable[hash] = 100 + depth
  if (depth === 0) {
    return
  }

  // console.log(depth + ' hash ' + hash)

  for (let i = 0; i < n; i++) {
    moveLeft(i, matrix)
    solveInner(depth - 1, matrix)
    moveRight(i, matrix)

    moveRight(i, matrix)
    solveInner(depth - 1, matrix)
    moveLeft(i, matrix)

    moveLeftUp(i, matrix)
    solveInner(depth - 1, matrix)
    moveRightDown(i, matrix)

    moveLeftDown(i, matrix)
    solveInner(depth - 1, matrix)
    moveRightUp(i, matrix)

    moveRightUp(i, matrix)
    solveInner(depth - 1, matrix)
    moveLeftDown(i, matrix)

    moveLeftDown(i, matrix)
    solveInner(depth - 1, matrix)
    moveRightUp(i, matrix)
  }
}

document.getElementById('solveBtn').onclick = solve

function solve() {
  //const mmm = matrices.map(r => r.map(c => c))
  //
  // moveLeftDown(1, matrices)
  // moveRight(2, matrices)
  // moveLeftDown(0, matrices)
  // moveLeftUp(2, matrices)
  // moveLeft(1, matrices)
  // moveRight(2, matrices)
  // moveLeftUp(0, matrices)


  // moveLeftDown(1, matrices)
  // moveRight(1, matrices)
  // moveLeftDown(0, matrices)
  // moveLeftUp(0, matrices)
  // moveLeft(1, matrices)
  // moveRight(1, matrices)
  // moveLeftUp(0, matrices)
  drawCube(matrices)

  // moveLeft(2)
  // moveLeftDown(1)

  console.log('start')
  const st = performance.now();
  try {
    solveInner(12, matrices)
  } finally {
    const en = performance.now();
    console.log('end ' + (en - st))
    drawCube(matrices)
  }

}

function applyTr() {
  cubicDiv.style.transform = `rotateX(${Math.trunc(trans.x / 10)}deg) rotateY(${Math.trunc(trans.y / 10)}deg) rotateZ(${Math.trunc(trans.z / 10)}deg)`
}

drawCube(matrices)
