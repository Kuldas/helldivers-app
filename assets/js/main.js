/**
 *	Importy
 */
import '../css/style.css';									// Import stylů
import { addToLeaderboard } from './database.js';		// Import db
import { arrowIcon } from './arrow-icons.js';	// Import funkce/í
import { version } from '../../package.json';				// Import verze hry

/**
 *	Promněné 
 */
const stratagemsDataPath = './data/stratagems.json';							// Cesta ke Stratagem datům
const gameVersionDisplay = document.getElementById('game-version');				// Získání elementu pro verzi hry
const stratagemName = document.getElementById('stratagem-name');				// Získání elementu pro jméno stratagemu
const stratagemSeq = document.getElementById('stratagem-seq');					// Získání elementu pro aktivační sekvenci stratagemu
const failedArrowsDisplay = document.getElementById('failedArrows');			// Získání elementu pro neúspěšně zmáčknuté šipky
const successArrowsDisplay = document.getElementById('successArrows')			// Získání elementu pro úspěšně zmáčknuté šipky
const completeStratagemsDisplay = document.getElementById('completeStratagems')	// Získání elementu pro úspěšné zavolané stratagemy
const playerScoreDisplay = document.getElementById('player-score');				// Získání elementu pro skóre hráče
const playerScoreBestDisplay = document.querySelector('.player-best');			// Získání elementu pro nejlepší skóre hráče
const progress = document.getElementById("countdown");							// Získání elementu countdown
const submitScoreBest = document.getElementById("submit-score");				// Získání elementu pro odeslání skóre
const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);	// Promněná, která kontroluje zda je uživatel na mobilu

/**
 *	Nastavení hry
 */
let gameSetup = {};				// Výchozí nastavení hry (prázdné)
let playerStats = {
	playerScore: 0,				// Skóre hráče
	playerScoreBest: 0,			// Nejlepší skóre hráče
	failedArrows: 0,			// Špatně zmáčknuté šipky
	successArrows: 0,			// Správně zmáčknuté šipky
	completeStratagems: 0		// Úspěšně "zavolané" stratagemy
}
let arrowPositionIndex = 0;		// Definice proměnné arrowPositionIndex
let countdownStartTime = null;	// Výchozí čas spuštění countdownu
let countdownDuration = 15000;	// aktuálně: 15sec - Výchozí čas pro countdown (v ms)
let seqBonusTime = 1500;		// aktuálně: 1,5sec - Bonusový čas za splněnou sekvenci (v ms)
let arrowPoints = 3;			// Počet bodů za správnou šipku v sekvenci
let seqPoints = 5;				// Počet bodů za dokončení sekvence stratagemu
let isGameRunning = false;		// Indikátor, zda byla hra spuštěna


/**
 *	HRA
 */

// Vrací verzi hry pro zobrazení na frontendu
gameVersionDisplay.textContent = "v" + version;

// Získání dat z JSON a přidání do gameSetup
fetch(stratagemsDataPath)
	.then((response) => {

		if (!response.ok) {
			throw new Error('Načítání dat selhalo');
		}
		return response.json();
	})
	.then((data) => {

		const stratagemsData = data;

		gameSetup = {
			stratagems: stratagemsData.stratagems,
			currentStratagem: [],
			isGameRunning,
			playerStats: playerStats
		};

		loadPlayerStats(gameSetup);
		console.log('Výchozí stav hry:', gameSetup);	// Zobrazení výchozího nastavení hry v konzoli (pro vývoj)

		startGame(gameSetup);	// Spuštění hry s výchozím nastavením
	})
	.catch((error) => {

		console.error('Chyba při načítání dat:', error);	// Odchycení chyby při načítání dat
	});

// 
function startGame(gameSetup) {

	const randomStratagem = randChoice(gameSetup.stratagems);
	gameSetup.currentStratagem = randomStratagem;

	stratagemName.textContent = gameSetup.currentStratagem.name;

	stratagemSeq.innerHTML = '';	// Vyprázdnění seznamu před přidáním nových šipek

	gameSetup.currentStratagem.activation_sequence.forEach((arrow, index) => {
		let listItem = document.createElement('li');

		listItem.innerHTML = arrowIcon(arrow);
		listItem.setAttribute('id', 'index-' + index);
		stratagemSeq.appendChild(listItem);
	});

	playerScoreDisplay.textContent = gameSetup.playerStats.playerScore;

	// Přidání nového event listeneru na dokument
	document.addEventListener('keydown', checkEventKey);
}

function startCountdown(duration) {

	function updateProgress(timestamp) {

		if (!countdownStartTime) countdownStartTime = timestamp;
		var elapsedTime = timestamp - countdownStartTime;
		var progressValue = Math.max(
			0,
			Math.min(10, 10 - (elapsedTime / duration) * 10)
		);
		progress.value = progressValue;

		if (progressValue > 0) {

			requestAnimationFrame(updateProgress);
		} else {

			gameOver();
		}
	}

	requestAnimationFrame(updateProgress);
}

// Funkce, která poslouchá jakou šipku uživatel zmáčkl a porovnáme s polem arrowKeys
function checkEventKey(event) {

	const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
	const arrowPressed = event.key;

	// Pokud uživatel stiskl klávesu, zkontrolujeme, zda je to správná šipka
	if (arrowKeys.includes(arrowPressed)) {

		event.preventDefault();

		checkArrow(arrowPressed, gameSetup.currentStratagem.activation_sequence);
	}
}

// Funkce, která kontroluje zmáčknutou šipku s šipkou v aktuální sekvenci
function checkArrow(arrow, sequence) {

	let currentArrow = sequence[arrowPositionIndex];
	let currentListItem = document.getElementById('index-' + arrowPositionIndex);

	if (arrow === currentArrow) {

		arrowPositionIndex++;	// Přesun na další šipku v sekvenci
		gameSetup.playerStats.playerScore = gameSetup.playerStats.playerScore + arrowPoints;	// Přičte k aktuálnímu skóre body za správnou šipku
		gameSetup.playerStats.successArrows += 1;	// Přičte 1 do statistiky, které sleduje správně stisknuté šipky

		currentListItem.classList.add('text-primary');	// Přidání třídy, která obarví úspěšně zmáčknutou šipku
		playerScoreDisplay.textContent = gameSetup.playerStats.playerScore;
		successArrowsDisplay.textContent = gameSetup.playerStats.successArrows;

		if (arrowPositionIndex === sequence.length) {

			countdownStartTime += seqBonusTime;
			gameSetup.playerStats.playerScore = gameSetup.playerStats.playerScore + (seqPoints * sequence.length);
			gameSetup.playerStats.completeStratagems += 1;

			playerScoreDisplay.textContent = gameSetup.playerStats.playerScore;
			completeStratagemsDisplay.textContent = gameSetup.playerStats.completeStratagems;

			arrowPositionIndex = 0; // Resetovat index pro další použití

			setTimeout(changeStratagem, 250); // Změna stratagemu po dokončení sekvence
		}

		// Pokud hra neběží, spustí se hra a odpočet
		if (!gameSetup.isGameRunning) {

			startCountdown(countdownDuration);
			gameSetup.isGameRunning = true;
		}

	} else {

		stratagemSeq.classList.add("animate__headShake");
		gameSetup.playerStats.failedArrows += 1;

		if (gameSetup.playerStats.playerScore > 0) {
			gameSetup.playerStats.playerScore = Math.max(0, gameSetup.playerStats.playerScore - 2);
		}

		playerScoreDisplay.textContent = gameSetup.playerStats.playerScore;
		failedArrowsDisplay.textContent = gameSetup.playerStats.failedArrows;

		// Po dokončení animace se odeberte třída "animate__headShake", aby se animace mohla opakovat
		stratagemSeq.addEventListener('animationend', () => {
			stratagemSeq.classList.remove('animate__headShake');
		});
	}
}

function changeStratagem() {

	let randomStratagem;

	do {
		randomStratagem = randChoice(gameSetup.stratagems);
	} while (randomStratagem === gameSetup.currentStratagem);

	gameSetup.currentStratagem = randomStratagem;

	stratagemName.textContent = gameSetup.currentStratagem.name;

	stratagemSeq.innerHTML = ''; // Vyprázdnění seznamu před přidáním nových šipek

	gameSetup.currentStratagem.activation_sequence.forEach((arrow, index) => {
		let listItem = document.createElement('li');
		listItem.innerHTML = arrowIcon(arrow);
		listItem.setAttribute('id', 'index-' + index);
		stratagemSeq.appendChild(listItem);
	});
}

function randChoice(arr) {

	return arr[Math.floor(Math.random() * arr.length)];
}

function gameOver() {

	const listItem = document.createElement('li');
	const restartButton = document.createElement('button');

	// Odstraní existující event listener, pokud existuje
	document.removeEventListener('keydown', checkEventKey);

	stratagemName.textContent = "Konec hry";

	stratagemSeq.innerHTML = ''; // Vyprázdnění seznamu
	restartButton.classList.add("btn", "btn-sm", "btn-primary");
	restartButton.textContent = 'Restart';
	restartButton.addEventListener('click', gameRestart);
	listItem.appendChild(restartButton)
	stratagemSeq.appendChild(listItem);

	if (gameSetup.playerStats.playerScore > gameSetup.playerStats.playerScoreBest) {
		gameSetup.playerStats.playerScoreBest = gameSetup.playerStats.playerScore;
		playerScoreBestDisplay.textContent = gameSetup.playerStats.playerScoreBest;
	}

	savePlayerStats();
}

function gameRestart() {

	resetGameSetup();
	startGame(gameSetup);
}

function resetGameSetup() {

	gameSetup.currentStratagem = [];
	gameSetup.isGameRunning = false;
	gameSetup.playerStats.playerScore = 0;
	arrowPositionIndex = 0;
	progress.value = "10";
	countdownStartTime = null;
}

function savePlayerStats() {

	// Destrukturalizace objektu playerStats a vynechání vlastnosti playerScore
	const { playerScore, ...filteredPlayerStats } = gameSetup.playerStats;
	const saveLocalStorage = JSON.stringify(filteredPlayerStats);

	localStorage.setItem('playerStats', saveLocalStorage);
}

function loadPlayerStats(gameSetup) {

	const playerStatsJson = localStorage.getItem('playerStats');
	const loadedPlayerStats = JSON.parse(playerStatsJson);

	gameSetup.playerStats = {
		...gameSetup.playerStats,
		...loadedPlayerStats
	};

	playerScoreBestDisplay.textContent = gameSetup.playerStats.playerScoreBest;
	failedArrowsDisplay.textContent = gameSetup.playerStats.failedArrows;
	successArrowsDisplay.textContent = gameSetup.playerStats.successArrows;
	completeStratagemsDisplay.textContent = gameSetup.playerStats.completeStratagems;
}

submitScoreBest.addEventListener('click', async function (event) {

	event.preventDefault();

	const playerNameInput = document.querySelector('input[name=playerName]');
	const playerNameLabel = document.getElementById("playerNameLabel");

	if (!playerNameInput.value) {

		playerNameLabel.classList.add("animate__headShake", "input-error");

		playerNameLabel.addEventListener('animationend', () => {
			playerNameLabel.classList.remove("animate__headShake", "input-error");
		});
	} else {

		addToLeaderboard(playerNameInput.value, gameSetup.playerStats.playerScoreBest)
			.then(data => {
				if (data) {
					const successSubmitPlayerScore = document.querySelector(".successSubmitPlayerScore");
					successSubmitPlayerScore.classList.toggle("hidden");
					setTimeout(function () {
						successSubmitPlayerScore.classList.toggle("hidden");
					}, 5000);
				}
			});
	}

	playerNameInput.value = '';
});

/**
 *	Mobile control
 */

if (isMobileDevice) {

	const mobileControlContainer = document.getElementById("mobileControl");
	const mobileControl = document.querySelectorAll('.kbd');

	mobileControlContainer.classList.toggle("hidden")
	mobileControl.forEach(arrow => {
		arrow.addEventListener('click', function () {
			let direction = this.getAttribute('data-direction');
			let event = new KeyboardEvent('keyup', { key: direction });
			checkEventKey(event);
		});
	});

	console.log("Uživatel používá mobilní zařízení.");
} else {

	console.log("Uživatel používá počítač.");
}