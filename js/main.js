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
  cubicBackDiv.innerHTML = ''

  cubicDiv.appendChild(addSide('0'))
  cubicDiv.appendChild(addSide('1'))
  cubicDiv.appendChild(addSide('2'))

  cubicBackDiv.appendChild(addSide('3'))
  cubicBackDiv.appendChild(addSide('4'))
  cubicBackDiv.appendChild(addSide('5'))

  matrices = [ getMatrix(W), getMatrix(B), getMatrix(O), getMatrix(G), getMatrix(R), getMatrix(Y) ]

  sides = [...Array(6)].map((_, i) => document.getElementById(`side${i}`))

  drawCube()
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

function moveRow(rowFrom, rowTo) {
  for(let i = 0; i < n; i++){
    rowTo[i] = rowFrom[i]
  }
}

function moveLeft(row) {
  console.log(`moveLeft ${row}`)
  const tempSide = matrices[1].map(r => r.map(c => c))
  for (let i = 1; i < 4; i++) {
    moveRow(matrices[i + 1][row], matrices[i][row])
  }
  moveRow(tempSide[row], matrices[4][row])
  if (row === 0) {
    moveSideCounterClockwise(matrices[0])
  }
  if (row === n - 1) {
    moveSideClockwise(matrices[5])
  }
}

function moveRight(row) {
  console.log(`moveRight ${row}`)
  const tempSide = matrices[4].map(r => r.map(c => c))
  for (let i = 4; i >= 2; i--) {
    moveRow(matrices[i - 1][row], matrices[i][row])
  }
  moveRow(tempSide[row], matrices[1][row])
  if (row === 0) {
    moveSideClockwise(matrices[0])
  }
  if (row === n - 1) {
    moveSideCounterClockwise(matrices[5])
  }
}

function moveSideClockwise(side) {
  const oldSide = side.map(r => r.map(c => c))
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
  // TODO: extra calculation i could do without, fix later
  moveSideClockwise(side)
  moveSideClockwise(side)
  moveSideClockwise(side)
}


function moveLeftUp(col) {
  console.log(`moveLeftUp ${col}`)
  const tempSide = matrices[2].map(r => r.map(c => c))
  for(let i = 0; i < n; i++) {
    matrices[2][i][col] = matrices[5][n - 1 - i][n - 1 - col]
  }
  for(let i = 0; i < n; i++) {
    matrices[5][i][n - 1 - col] = matrices[4][i][n - 1 - col]
  }
  for(let i = 0; i < n; i++) {
    matrices[4][i][n - 1 - col] = matrices[0][n - 1 - col][n - 1 - i]
  }
  for(let i = 0; i < n; i++) {
    matrices[0][n - 1 - col][i] = tempSide[i][col]
  }
  if (col === 0) {
    moveSideClockwise(matrices[1])
  }
  if (col === n - 1) {
    moveSideCounterClockwise(matrices[3])
  }
}

function moveLeftDown(col) {
  const tempSide = matrices[1].map(r => r.map(c => c))
  for(let i = 0; i < n; i++) {
    matrices[1][i][col] = matrices[0][i][col]
  }
  for(let i = 0; i < n; i++) {
    matrices[0][i][col] = matrices[3][n - 1 - i][n - 1 - col]
  }
  for(let i = 0; i < n; i++) {
    matrices[3][i][n - 1 - col] = matrices[5][col][i]
  }
  for(let i = 0; i < n; i++) {
    matrices[5][col][n - 1 - i] = tempSide[i][col]
  }
  if (col === 0) {
    moveSideCounterClockwise(matrices[4])
  }
  if (col === n - 1) {
    moveSideClockwise(matrices[2])
  }
}

function moveRightUp(col) {
  // TODO: same
  moveLeftDown(col)
  moveLeftDown(col)
  moveLeftDown(col)
}

function moveRightDown(col) {
  // TODO: that sh*t again
  moveLeftUp(col)
  moveLeftUp(col)
  moveLeftUp(col)
}

function drawCube() {
  for(let i = 0; i < 6; i++) {
    fillSide(matrices[i], sides[i])
  }
}

// moveLeft(1)
drawCube()

let draggable = null

resetBtn.addEventListener("click", (e) => {
  initCubes(Number(rowSize.value))
})

document.body.addEventListener('mousedown', function(e) {
  if (draggable) {
    draggable.target.classList.remove('dragging')
    draggable = null
  }

  if (!e.target.classList.contains('cell')) {
    return
  }
  const {side, row, cell} = e.target.dataset


  const coords = getCoords(e.target);
  const shiftX = e.pageX - coords.left;
  const shiftY = e.pageY - coords.top;
  e.target.classList.add('dragging')

  draggable = {
    side: Number(side),
    row: Number(row),
    cell: Number(cell),
    x: e.clientX,
    y: e.clientY,
    target: e.target
  }

  console.log(draggable)

})

document.body.addEventListener('mouseup',  function(e) {
  if (draggable == null) {
    return
  }

  const shiftX = e.clientX - draggable.x
  const shiftY = e.clientY - draggable.y
  const absShiftX = Math.abs(shiftX)
  const absShiftY = Math.abs(shiftY)
  draggable.target.classList.remove('dragging')

  if (e.target.classList.contains('cell')) {
    const {side, row, cell} = e.target.dataset
    if (side === draggable.side && row === draggable.row && cell === draggable.cell) {
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
    if (isLeft || isLeftUp) moveLeft(draggable.row)
    if (isRight || isRightDown) moveRight(draggable.row)
  }
  if (draggable.side === 1) {
    if (isUp) moveRightUp(draggable.cell)
    if (isDown) moveLeftDown(draggable.cell)
  }
  if (draggable.side === 4) {
    if (isUp) moveRightDown(n - 1 - draggable.cell)
    if (isDown) moveLeftUp(n - 1 - draggable.cell)
  }
  if (draggable.side === 2 || draggable.side === 3) {
    if (isLeft || isLeftDown) moveLeft(draggable.row)
    if (isRight || isRightUp) moveRight(draggable.row)
  }
  if (draggable.side === 2) {
    if (isUp) moveLeftUp(draggable.cell)
    if (isDown) moveRightDown(draggable.cell)
  }
  if (draggable.side === 3) {
    if (isUp) moveLeftDown(n - 1 - draggable.cell)
    if (isDown) moveRightUp(n - 1 - draggable.cell)
  }
  if (draggable.side === 0) {
    if (isRightUp) moveRightUp(draggable.cell)
    if (isRightDown) moveRightDown(n - 1 - draggable.row)
    if (isLeftUp) moveLeftUp(n - 1 - draggable.row)
    if (isLeftDown) moveLeftDown(draggable.cell)
  }
  if (draggable.side === 5) {
    if (isRightUp) moveRightDown(n - 1 - draggable.cell)
    if (isRightDown) moveRightUp(draggable.row)
    if (isLeftUp) moveLeftDown(draggable.row)
    if (isLeftDown) moveLeftUp(n - 1 - draggable.cell)
  }


  console.log(shiftX, shiftY, `down=${isDown} up=${isUp} left=${isLeft} right=${isRight} ld=${isLeftDown} lu=${isLeftUp} rd=${isRightDown} ru=${isRightUp}`)
  draggable = null
  drawCube()
})

document.body.addEventListener('mouseover',  function(e) {
  if (draggable == null) {
    return
  }

  const shiftX = e.clientX - draggable.x
  const shiftY = e.clientY - draggable.y
  // console.log(shiftX, shiftY)
})

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
