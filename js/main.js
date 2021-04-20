// const canvas = document.getElementById('canvas');
// const ctx = canvas.getContext('2d');

const cubicDiv = document.getElementById(`cubicDiv`)
const cubicBackDiv = document.getElementById(`cubicBackDiv`)
const resetBtn = document.getElementById(`resetBtn`)
let n = 3


const G = 'G'
const Y = 'Y'
const W = 'W'
const O = 'O'
const B = 'B'
const R = 'R'

let sides = []
let matrices = []
let currentHash = 'WBOGRY'



function addSide(s) {
  const side = document.createElement('div')
  side.id = `side${s}`
  side.classList.add('side')
  side.dataset.s = s
  for(let i = 0; i < n; i++) {
    const row = document.createElement('div')
    row.classList.add('row')
    row.dataset.row = i
    row.dataset.side = s
    for(let j = 0; j < n; j++) {
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
  // cubicBackDiv.innerHTML = ''

  cubicDiv.appendChild(addSide('0'))
  cubicDiv.appendChild(addSide('1'))
  cubicDiv.appendChild(addSide('2'))

  cubicDiv.appendChild(addSide('3'))
  cubicDiv.appendChild(addSide('4'))
  cubicDiv.appendChild(addSide('5'))

  matrices = [ getMatrix(W), getMatrix(B), getMatrix(O), getMatrix(G), getMatrix(R), getMatrix(Y) ]

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
  const mat = [ getMatrix(W), getMatrix(B), getMatrix(O), getMatrix(G), getMatrix(R), getMatrix(Y) ]
  for(let i = 0; i < hash.length; i++) {
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
  for(let i = 0; i < n; i++){
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
  for(let i = 0; i < n; i++) {
    matrix[2][i][col] = matrix[5][n - 1 - i][n - 1 - col]
  }
  for(let i = 0; i < n; i++) {
    matrix[5][i][n - 1 - col] = matrix[4][i][n - 1 - col]
  }
  for(let i = 0; i < n; i++) {
    matrix[4][i][n - 1 - col] = matrix[0][n - 1 - col][n - 1 - i]
  }
  for(let i = 0; i < n; i++) {
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
  for(let i = 0; i < n; i++) {
    matrix[1][i][col] = matrix[0][i][col]
  }
  for(let i = 0; i < n; i++) {
    matrix[0][i][col] = matrix[3][n - 1 - i][n - 1 - col]
  }
  for(let i = 0; i < n; i++) {
    matrix[3][i][n - 1 - col] = matrix[5][col][i]
  }
  for(let i = 0; i < n; i++) {
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
  for(let i = 0; i < n; i++) {
    matrix[1][i][col] = matrix[5][col][n - 1 - i]
  }
  for(let i = 0; i < n; i++) {
    matrix[5][col][i] = matrix[3][i][n - 1 - col]
  }
  for(let i = 0; i < n; i++) {
    matrix[3][n - 1 - i][n - 1 - col] = matrix[0][i][col]
  }
  for(let i = 0; i < n; i++) {
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
  for(let i = 0; i < n; i++) {
    matrix[2][i][col] = matrix[0][n - 1 - col][i]
  }
  for(let i = 0; i < n; i++) {
    matrix[0][n - 1 - col][n - 1 - i] = matrix[4][i][n - 1 - col]
  }
  for(let i = 0; i < n; i++) {
    matrix[4][i][n - 1 - col] = matrix[5][i][n - 1 - col]
  }
  for(let i = 0; i < n; i++) {
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
  for(let i = 0; i < 6; i++) {
    fillSide(matrix[i], sides[i])
  }
}

// moveLeft(1)
drawCube(matrices)

let draggable = null

resetBtn.addEventListener('click', (e) => {
  initCubes(Number(rowSize.value))
})

document.getElementById(`randomizeBtn`).addEventListener('click', (e) => {
  for(let i = 0; i < Number(randomizeDepth.value); i++) {
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



let isMenuOpen = false
let isPaletteOpen = false
let paletteColor = null
let paletteColorBtn = null

document.body.addEventListener('mousedown', mouseDown)
document.body.addEventListener('touchstart', mouseDown)
function mouseDown(e) {
  if (draggable) {
    draggable.target.classList.remove('dragging')
    draggable = null
  }

  if (!e.target.classList.contains('cell')) {
    return
  }
  const {side, row, cell} = e.target.dataset


  const coords = getCoords(e.target);
  const shiftX = (e.pageX || e.changedTouches[0].pageX) - coords.left;
  const shiftY = (e.pageY || e.changedTouches[0].pageY) - coords.top;
  e.target.classList.add('dragging')

  draggable = {
    side: Number(side),
    row: Number(row),
    cell: Number(cell),
    x: e.clientX || e.changedTouches[0].clientX,
    y: e.clientY || e.changedTouches[0].clientY,
    target: e.target
  }

  console.log(draggable)

}

document.body.addEventListener('mouseup',  mouseUp)
document.body.addEventListener('touchend', mouseUp)

function mouseUp(e) {
  if (draggable == null) {
    return
  }

  const shiftX = (e.clientX || e.changedTouches[0].clientX) - draggable.x
  const shiftY = (e.clientY || e.changedTouches[0].clientY) - draggable.y
  const absShiftX = Math.abs(shiftX)
  const absShiftY = Math.abs(shiftY)
  draggable.target.classList.remove('dragging')

  if (e.target.classList.contains('cell')) {
    const side = Number(e.target.dataset.side)
    const row = Number(e.target.dataset.row)
    const cell = Number(e.target.dataset.cell)
    if (e.changedTouches == null && (side === draggable.side && row === draggable.row && cell === draggable.cell)
    || e.changedTouches && (absShiftY < 20) && (absShiftY < 20)) {
      if (paletteColor !== null) {
        matrices[side][row][cell] = paletteColor
        drawCube(matrices)
      }
      return
    }
  }

  const isDown = absShiftY > absShiftX * 2 && (shiftY > 30)
  const isUp = absShiftY > absShiftX * 2 && (shiftY < -30)
  const isLeft = absShiftX > absShiftY * 2 && (shiftX < -30)
  const isRight = absShiftX > absShiftY * 2 && (shiftX > 30)
  const isLeftDown = absShiftX < absShiftY * 2 &&  absShiftY < absShiftX * 2 && (shiftX < -20) && (shiftY > 20)
  const isLeftUp = absShiftX < absShiftY * 2 && absShiftY < absShiftX * 2 && (shiftX < -20) && (shiftY < -20)
  const isRightDown = absShiftX < absShiftY * 2 && absShiftY < absShiftX * 2 && (shiftX > 20) && (shiftY > 20)
  const isRightUp = absShiftX < absShiftY * 2 && absShiftY < absShiftX * 2 && (shiftX > 20) && (shiftY < -20)

  const fromSide = draggable.side
  if (draggable.side === 1 || draggable.side === 4) {
    if (isLeft || isLeftUp) moveLeft(draggable.row, matrices)
    if (isRight || isRightDown) moveRight(draggable.row, matrices)
  }
  if (draggable.side === 1) {
    if (isUp) moveRightUp(draggable.cell, matrices)
    if (isDown) moveLeftDown(draggable.cell, matrices)
  }
  if (draggable.side === 4) {
    if (isUp) moveRightDown(n - 1 - draggable.cell, matrices)
    if (isDown) moveLeftUp(n - 1 - draggable.cell, matrices)
  }
  if (draggable.side === 2 || draggable.side === 3) {
    if (isLeft || isLeftDown) moveLeft(draggable.row, matrices)
    if (isRight || isRightUp) moveRight(draggable.row, matrices)
  }
  if (draggable.side === 2) {
    if (isUp) moveLeftUp(draggable.cell, matrices)
    if (isDown) moveRightDown(draggable.cell, matrices)
  }
  if (draggable.side === 3) {
    if (isUp) moveLeftDown(n - 1 - draggable.cell, matrices)
    if (isDown) moveRightUp(n - 1 - draggable.cell, matrices)
  }
  if (draggable.side === 0) {
    if (isRightUp) moveRightUp(draggable.cell, matrices)
    if (isRightDown) moveRightDown(n - 1 - draggable.row, matrices)
    if (isLeftUp) moveLeftUp(n - 1 - draggable.row, matrices)
    if (isLeftDown) moveLeftDown(draggable.cell, matrices)
  }
  if (draggable.side === 5) {
    if (isRightUp) moveRightDown(n - 1 - draggable.cell, matrices)
    if (isRightDown) moveRightUp(draggable.row, matrices)
    if (isLeftUp) moveLeftDown(draggable.row, matrices)
    if (isLeftDown) moveLeftUp(n - 1 - draggable.cell, matrices)
  }


  console.log(shiftX, shiftY, `down=${isDown} up=${isUp} left=${isLeft} right=${isRight} ld=${isLeftDown} lu=${isLeftUp} rd=${isRightDown} ru=${isRightUp}`)
  draggable = null
  drawCube(matrices)
}

document.body.ondragstart = function() {
  return false;
};

function getCoords(elem) {   // кроме IE8-
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

document.getElementById('palette').addEventListener('click', function(e) {
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

  for(let i = 0; i < n; i ++) {
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

// solve()
