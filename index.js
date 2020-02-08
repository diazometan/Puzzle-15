const boxElem = document.querySelector('.box');
const resetButtonElem = document.querySelector('.button_type_reset');
const startButtonElem = document.querySelector('.button_type_start');
const timerValueElem = document.querySelector('.statistics__timer-value');
const playerNameElem = document.querySelector('.statistics__player-name');
const form = document.forms.new;

let timerId;

let cells = [];

/* Инициализация игры */
for (let i = 1; i < 16; i++) {
    cells.push(i);
}
cells.push(0);

renderCells();

/* Обработчики */

form.addEventListener('submit', function (event) {
    event.preventDefault();
    stopGame();
    clearTimer();

    const playerName = form.elements.name;

    playerNameElem.textContent = playerName.value;
});

resetButtonElem.addEventListener('click', function () {
    stopGame();
    resetCells();
});

startButtonElem.addEventListener('click', function () {
    activateCells();
    activateTimer();
    boxElem.addEventListener('click', cellClickHandler);
});


function cellClickHandler(e) {
    const targetCell = e.target.closest('.cell');
    if (!targetCell || targetCell.id === '0') {
        return;
    }

    const num = +targetCell.id; // преобразуем String --> Number
    const canCellMove = checkCell(num);

    if (!canCellMove) {
        return;
    }

    // ячейка может двигаться: обновляем массив и страницу
    const numIdx = cells.indexOf(num);
    const zeroIdx = cells.indexOf(0);
    cells[numIdx] = 0;
    cells[zeroIdx] = num;

    const zeroCell = document.querySelector('[id="0"]');
    repaintCell(targetCell, 0);
    repaintCell(zeroCell, num);

    const isGameOver = checkGame();

    if (!isGameOver) {
        return;
    }

    stopGame();
    addWinnerToList();

    setTimeout(function () {
        alert('You win! Game over!');
    }, 0);
}

function stopGame() {
    boxElem.removeEventListener('click', cellClickHandler);

    clearInterval(timerId);

    const cellElems = document.querySelectorAll('.cell');
    cellElems.forEach(function (el) {
        el.classList.remove('cell_active');
    });
}

/* Проверка закончилась ли игра */
function checkGame() {
    return cells.slice(0, 15).every(function (v, i) {
        return v === i + 1;
    });
}

/* Добавляет победителя в список */
function addWinnerToList() {
    const winnerList = document.querySelector('.statistics__winners-list');

    const winner = createElem('li', 'statistics__winners-item');
    const playerName = form.elements.name;
    winner.textContent = playerName.value + ' - ' + timerValueElem.textContent + ' sec';

    winnerList.appendChild(winner);
}

function addWinnerToLocalStorage() {
    //localStorage.
}

/**
 * Создает элемент
 * @param {String} elementType - тип DOM элемента
 * @param {String} elementClass - классы, который нужно добавить
 * @return {Object}
 */
function createElem(elementType, elementClass) {
    const elem = document.createElement(elementType);
    elem.classList.add(elementClass);
    return elem;
}

/*
 * Проверка ячейки в массиве: может ли она двигаться?
 * Сells: границы массива 0 и 15
 * проверяем ячейки сверху, снизу, слева, справа
 *  - проверить не выходим ли мы за диапазон массива (будет ошибка)
 *  - если находим 0 --> ячейка может двигаться
 */
function checkCell(n) {
    const idx = cells.indexOf(n);

    // ячейка сверху
    const upIdx = idx - 4;
    if ((upIdx >= 0) && (cells[upIdx] === 0)) {
        return true;
    }

    // ячейка снизу
    const downIdx = idx + 4;
    if ((downIdx < 16) && (cells[downIdx] === 0)) {
        return true;
    }

    // ячейка слева
    const leftIdx = idx - 1;
    if ((leftIdx >= 0) && (idx % 4 !== 0) && (cells[leftIdx] === 0)) {
        return true;
    }

    // ячейка справа
    const rightIdx = idx + 1;
    if ((rightIdx < 16) && (rightIdx % 4 !== 0) && (cells[rightIdx] === 0)) {
        return true;
    }

    return false;
}

/* Активация ячеек */
function activateCells() {
    const cellElems = document.querySelectorAll('.cell');
    cellElems.forEach(function (el) {
        el.classList.add('cell_active');
    });
}

/* Активация таймера */
function activateTimer() {
    clearTimer();

    const startTime = new Date();

    timerId = setInterval(function () {
        let currentTime = new Date();
        let diff = moment.utc(moment(currentTime, "DD/MM/YYYY HH:mm:ss")
            .diff(moment(startTime, "DD/MM/YYYY HH:mm:ss"))).format("mm:ss")

        timerValueElem.textContent = diff;
    }, 1000);
}

/* Отчистка таймера */
function clearTimer() {
    clearInterval(timerId);
    timerValueElem.textContent = '00:00';
}

/**
 * Сброс массива и перерисовка значений в ячейках
 * @return {void}
 */
function resetCells() {
    clearInterval(timerId);
    cells = _.shuffle(cells);

    const cellElems = document.querySelectorAll('.cell');

    cells.forEach(function (n, i) {
        repaintCell(cellElems[i], n);
    });
}

/**
 * Рендерит ячейки
 *
 * @return {void}
 */
function renderCells() {
    const cellTemplate = document.querySelector('[data-component="cell"]');

    cells.forEach(function (n) {
        const cellFragment = cellTemplate.content.cloneNode(true);
        const cellElem = cellFragment.querySelector('.cell');

        repaintCell(cellElem, n);
        boxElem.appendChild(cellElem);
    });
}

/**
 * Обновляет ячейку
 * @param {Object} cellElem - элемент ячейки
 * @param {Number} n - число для записи в ячейку
 * @return {void}
 */
function repaintCell(cellElem, n) {
    const cellNumElem = cellElem.querySelector('.cell__num');
    cellElem.id = n;
    cellNumElem.textContent = n;
}
