class TicTacToe {
	resetBoard() {
		this.board = new Array(9).fill(null);
		this.turn = 'X';
		this.winner = null;
		// To handle draws
		this.hasGameEnded = false;
		this.count = 0;
	}
	constructor() {
		this.resetBoard();
	}

	makeMove(idx) {
		if (idx < 0 || idx >= 9) {
			throw new Error('Invalid move');
		}
		if (this.board[idx]) {
			throw new Error('Invalid square');
		}
		if (this.winner) {
			throw new Error('Game has ended');
		}
		if (this.hasGameEnded) {
			throw new Error('Game has ended');
		}
		// making the move
		this.board[idx] = this.turn;
		this.count++;
		// switch turns
		this.turn = this.turn === 'X' ? 'O' : 'X';
	}

	checkState(idx) {
		// lookup table
		const lookupObj = {
			0: [
				[1, 2],
				[3, 6],
				[4, 8]
			],
			1: [
				[0, 2],
				[4, 7]
			],
			2: [
				[0, 1],
				[5, 8],
				[4, 6]
			],
			3: [
				[0, 6],
				[4, 5]
			],
			4: [
				[1, 7],
				[3, 5],
				[0, 8],
				[2, 6]
			],
			5: [
				[2, 8],
				[3, 4]
			],
			6: [
				[0, 3],
				[7, 8],
				[2, 4]
			],
			7: [
				[1, 4],
				[6, 8]
			],
			8: [
				[0, 4],
				[2, 5],
				[6, 7]
			]
		};
		// check if the idx play has won the game
		lookupObj[idx].some((item) => {
			if (
				this.board[idx] === this.board[item[0]] &&
				this.board[idx] === this.board[item[1]]
			) {
				this.winner = this.board[idx];
				this.hasGameEnded = true;
			}
		});
		// if board is full and no one has won, then game has ended anyways
		if (this.count === 9 && !this.hasGameEnded) {
			this.hasGameEnded = true;
		}
		return this.hasGameEnded;
	}

	getSquare(idx) {
		return this.board[idx];
	}
}

// hook into the DOM
const board = document.getElementById('board');
const cover = document.getElementById('cover');
const startBtn = document.getElementById('start');
const winner = document.getElementById('winner');
const xEl = document.getElementById('x');
const xWinsEl = xEl.children[0];
const xBtn = xEl.children[1];
const oEl = document.getElementById('o');
const oWinsEl = oEl.children[0];
const oBtn = oEl.children[1];
// access the localstorage
const storage = window.localStorage;
// access lifetime wins
const lifetimeWins = storage.getItem('lifetimeWins');
let parsedLifetimeWins;
try {
	parsedLifetimeWins = JSON.parse(lifetimeWins) ?? {};
} catch (err) {
	parsedLifetimeWins = {};
}
const playerNames = storage.getItem('playerNames');
let [xName, yName] = playerNames ? playerNames.split(',') : ['X', 'Y'];
let parsedWins = [0, 0];
if (parsedLifetimeWins && parsedLifetimeWins[xName + ',' + yName]) {
	parsedWins = parsedLifetimeWins[xName + ',' + yName]
		.split(',')
		.map((item) => parseInt(item));
}
let [xWins, oWins] = parsedWins;
let game = null;
// add an onclick event listener to the cover, to add the "removed" class
startBtn.addEventListener('click', () => {
	// set winner text to empty
	winner.textContent = 'Current turn: X';
	// create a new game
	game = new TicTacToe();
	// purge and reset the board
	board.innerHTML = '';
	Array.from({ length: 9 }).forEach((_, idx) => {
		const square = document.createElement('button');
		square.className = 'square btn';
		square.id = idx;
		board.appendChild(square);
	});
	// remove the cover
	cover.classList.add('removed');
	// add event listeners to all the squares
	Array.from(board.children).forEach((square) => {
		square.addEventListener('click', onClickHandler);
		square.addEventListener('mouseenter', onHoverHandler);
		square.addEventListener('mouseleave', onLeaveHandler);
	});
});

const submitNames = (e) => {
	e.preventDefault();
	// get theparent node
	const parent = e.target.parentNode;
	// console.log(parent.children);
	const inputEl = parent.children[1];
	const submitEl = parent.children[2];
	// get pa or p2 by looking at the parent id
	const isX = parent.id === 'x';
	// console.log(isX);
	// update xName or yName
	if (isX) {
		xName = inputEl.value;
		storage.setItem('playerNames', `${xName},${yName}`);
		// update parsed wins if they exist
		if (parsedLifetimeWins && parsedLifetimeWins[xName + ',' + yName]) {
			parsedWins = parsedLifetimeWins[xName + ',' + yName]
				.split(',')
				.map((item) => parseInt(item));
			[xWins, oWins] = parsedWins;
		}
		// update the lifetime wins
		xWinsEl.textContent = `${xName}: ${xWins}`;
	} else {
		yName = inputEl.value;
		storage.setItem('playerNames', `${xName},${yName}`);
		if (parsedLifetimeWins && parsedLifetimeWins[xName + ',' + yName]) {
			parsedWins = parsedLifetimeWins[xName + ',' + yName]
				.split(',')
				.map((item) => parseInt(item));
			[xWins, oWins] = parsedWins;
		}
		// update the lifetime wins
		oWinsEl.textContent = `${yName}: ${oWins}`;
	}
	// replace the input with a button
	const btn = document.createElement('button');
	btn.textContent = `Change ${isX ? 'P1' : 'P2'} name`;
	// add an event listener to the button
	btn.addEventListener('click', changeToInput);
	// replace input with button
	parent.replaceChild(btn, inputEl);
	// remove the submit button
	parent.removeChild(submitEl);
};

const changeToInput = (e) => {
	e.preventDefault();
	// replace the first child of the parent with a text input
	const parent = e.target.parentNode;
	const input = document.createElement('input');
	input.type = 'text';
	// find p1 or p1 by looking at the parent id
	const isX = parent.id === 'x';
	// set the input value to the current text
	input.value = isX ? xName : yName;
	// replace self with a different button
	const submit = document.createElement('button');
	submit.textContent = 'Submit';
	// add an event listener to the submit button
	submit.addEventListener('click', submitNames);
	// replace self with the input
	parent.replaceChild(input, e.target);
	// add the submit button
	parent.appendChild(submit);
};

const onClickHandler = (e) => {
	e.preventDefault();
	// get self id
	const id = e.target.id;
	// make move
	game.makeMove(id);
	// update self text
	e.target.textContent = game.getSquare(id);
	// update self class
	e.target.classList.add('btn-disabled');
	e.target.classList.remove('btn');
	if (game.getSquare(id) === 'X') {
		e.target.classList.add('blue');
	} else if (game.getSquare(id) === 'O') {
		e.target.classList.add('red');
	}
	// update self to be disabled
	e.target.disabled = true;
	// remove all event handlers
	e.target.removeEventListener('click', onClickHandler);
	e.target.removeEventListener('mouseenter', onHoverHandler);
	e.target.removeEventListener('mouseleave', onLeaveHandler);
	// switch turns
	winner.textContent = `Current turn: ${game.turn}`;
	// check if game has ended
	if (game.checkState(id)) {
		// remove all event listeners
		Array.from(board.children).forEach((square) => {
			square.removeEventListener('click', onClickHandler);
			square.removeEventListener('mouseenter', onHoverHandler);
			square.removeEventListener('mouseleave', onLeaveHandler);
		});
		// show the cover
		cover.classList.remove('removed');
		// show the winner
		winner.textContent = game.winner ? `${game.winner} has won!` : 'Draw!';
		if (game.winner === 'X') {
			xWins++;
			// update parsed lifetime wins
			parsedLifetimeWins[xName + ',' + yName] = `${xWins},${oWins}`;
			parsedLifetimeWins[yName + ',' + xName] = `${oWins},${xWins}`;
			console.log(parsedLifetimeWins);
			// update the lifetime wins
			xWinsEl.textContent = `${xName}: ${xWins}`;
			oWinsEl.textContent = `${yName}: ${oWins}`;
			// update the localstorage
			storage.setItem('lifetimeWins', JSON.stringify(parsedLifetimeWins));
		} else {
			oWins++;
			// update parsed lifetime wins
			parsedLifetimeWins[xName + ',' + yName] = `${xWins},${oWins}`;
			parsedLifetimeWins[yName + ',' + xName] = `${oWins},${xWins}`;
			console.log(parsedLifetimeWins);
			// update the lifetime wins
			xWinsEl.textContent = `${xName}: ${xWins}`;
			oWinsEl.textContent = `${yName}: ${oWins}`;
			// update the localstorage
			storage.setItem('lifetimeWins', JSON.stringify(parsedLifetimeWins));
		}
	}
};

const onHoverHandler = (e) => {
	if (e.target.textContent === '') {
		e.target.textContent = game.turn;
		if (game.turn === 'X') {
			e.target.classList.add('blue');
		} else if (game.turn === 'O') {
			e.target.classList.add('red');
		}
	}
};

const onLeaveHandler = (e) => {
	if (e.target.textContent === game.turn) {
		e.target.textContent = '';
	}
	if (game.turn === 'X') {
		e.target.classList.remove('blue');
	} else if (game.turn === 'O') {
		e.target.classList.remove('red');
	}
};

// populate the board with 9 squares with ids 0-8
Array(9).forEach((_, idx) => {
	const square = document.createElement('button');
	square.className = 'square btn';
	square.id = idx;
	board.appendChild(square);
});
// bind event listeners to the buttons
xBtn.addEventListener('click', changeToInput);
oBtn.addEventListener('click', changeToInput);
// populate the lifetime wins
xWinsEl.textContent = `${xName}: ${xWins}`;
oWinsEl.textContent = `${yName}: ${oWins}`;
