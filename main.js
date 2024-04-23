/**
 *	Importy
 */
import './style.css';									// Import stylů
import { arrowIcon } from './assets/js/functions.js';	// Import funkce/í
import { version } from './package.json';				// Import verze hry

/**
 *	Promněné 
 */
const stratagemsDataPath = './data/stratagems.json';					// Cesta ke Stratagem datům
const gameVersionDisplay = document.getElementById('game-version');		// Získání elementu pro verzi hry
const stratagenName = document.getElementById('stratagem-name');		// Získání elementu pro jméno stratagemu
const stratagenSeq = document.getElementById('stratagem-seq');			// Získání elementu pro aktivační sekvenci stratagemu
const failedArrowsDisplay = document.getElementById('failedArrows')		// Získání elementu pro neúspěšně zmáčknuté šipky
const successArrowsDisplay = document.getElementById('successArrows')	// Získání elementu pro úspěšně zmáčknuté šipky
const completeStratagemsDisplay = document.getElementById('completeStratagems')	// Získání elementu pro úspěšné zavolané stratagemy
const playerScoreDisplay = document.getElementById('player-score');		// Získání elementu pro skóre hráče
const playerScoreBestDisplay = document.getElementById('player-best');	// Získání elementu pro nejlepší skóre hráče
const progress = document.getElementById("countdown");					// Získání elementu countdown
const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);	// Promněná, která kontroluje zda je uživatel na mobilu

/**
 *	Nastavení hry
 */
let gameSetup = {};				// Výchozí nastavení hry (prázdné)
let playerStats = {
	playerName: null,			// Jméno hráče (aktuálně nefunkční)
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
let arrowPoints = 5;			// Počet bodů za správnou šipku v sekvenci
let seqPoints = 10;				// Počet bodů za dokončení sekvence stratagemu
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
		console.log('Data z JSON:', stratagemsData);	// Zobrazení dat v konzoli (pro vývoj)

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

function startGame(gameSetup) {
	const randomStratagem = randChoice(gameSetup.stratagems);
	gameSetup.currentStratagem = randomStratagem;

	stratagenName.textContent = gameSetup.currentStratagem.name;

	stratagenSeq.innerHTML = ''; // Vyprázdnění seznamu před přidáním nových šipek

	gameSetup.currentStratagem.activation_sequence.forEach((arrow, index) => {
		let listItem = document.createElement('li');

		listItem.innerHTML = arrowIcon(arrow);
		listItem.setAttribute('id', 'index-' + index);
		stratagenSeq.appendChild(listItem);
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

function checkEventKey(event) {

	const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
	const arrowPressed = event.key;

	// Pokud uživatel stiskl klávesu, zkontrolujeme, zda je to správná šipka
	if (arrowKeys.includes(arrowPressed)) {
		event.preventDefault();

		checkArrow(arrowPressed, gameSetup.currentStratagem.activation_sequence);
	}
}

function checkArrow(arrow, sequence) {
	const currentArrow = sequence[arrowPositionIndex];
	const currentListItem = document.getElementById('index-' + arrowPositionIndex);

	if (arrow === currentArrow) {
		arrowPositionIndex++; // Přesun na další šipku v sekvenci
		gameSetup.playerStats.playerScore = gameSetup.playerStats.playerScore + arrowPoints;
		gameSetup.playerStats.successArrows += 1;

		currentListItem.classList.add('text-primary'); // Přidání třídy pro zelenou barvu
		playerScoreDisplay.textContent = gameSetup.playerStats.playerScore;
		successArrowsDisplay.textContent = gameSetup.playerStats.successArrows;

		console.log(gameSetup.playerStats.playerScore);
		console.log('Správná šipka!');

		if (arrowPositionIndex === sequence.length) {
			countdownStartTime += seqBonusTime;
			gameSetup.playerStats.playerScore = gameSetup.playerStats.playerScore + seqPoints;
			gameSetup.playerStats.completeStratagems += 1;

			playerScoreDisplay.textContent = gameSetup.playerStats.playerScore;
			completeStratagemsDisplay.textContent = gameSetup.playerStats.completeStratagems;

			arrowPositionIndex = 0; // Resetovat index pro další použití

			setTimeout(changeStratagem, 250); // Změna stratagemu po dokončení sekvence

			console.log('Gratuluji kadete, úspěšně sis zavolal stratagem! Asi nebudeš taková sračka.');
		}

		if (!gameSetup.isGameRunning) {
			startCountdown(countdownDuration);
			gameSetup.isGameRunning = true;
		}

	} else {
		stratagenSeq.classList.add("animate__headShake");
		gameSetup.playerStats.failedArrows += 1;

		if (gameSetup.playerStats.playerScore > 0) gameSetup.playerStats.playerScore = gameSetup.playerStats.playerScore - arrowPoints;

		playerScoreDisplay.textContent = gameSetup.playerStats.playerScore;
		failedArrowsDisplay.textContent = gameSetup.playerStats.failedArrows;

		// Po určité době (500ms) se odeberte třída "animate__headShake", aby se animace mohla opakovat
		setTimeout(function () {
			stratagenSeq.classList.remove('animate__headShake');
		}, 500);

		console.log('Špatná šipka! Začni makat!');
	}
}

function changeStratagem() {
	let randomStratagem;

	do {
		randomStratagem = randChoice(gameSetup.stratagems);
	} while (randomStratagem === gameSetup.currentStratagem);

	gameSetup.currentStratagem = randomStratagem;

	stratagenName.textContent = gameSetup.currentStratagem.name;

	stratagenSeq.innerHTML = ''; // Vyprázdnění seznamu před přidáním nových šipek

	gameSetup.currentStratagem.activation_sequence.forEach((arrow, index) => {
		let listItem = document.createElement('li');
		listItem.innerHTML = arrowIcon(arrow);
		listItem.setAttribute('id', 'index-' + index);
		stratagenSeq.appendChild(listItem);
	});

	console.log("Stav hry po vybrání náhodného stratagemu:", gameSetup);
	console.log("Nový náhodný stratagem:", gameSetup.currentStratagem.name);
}

function randChoice(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function gameRestart() {

	resetGameSetup();
	startGame(gameSetup);

	console.log("Stav hry po resetu:", gameSetup)
}

function resetGameSetup() {
	gameSetup.currentStratagem = [];
	gameSetup.isGameRunning = false;
	gameSetup.playerStats.playerScore = 0;
	arrowPositionIndex = 0;
	progress.value = "10";
	countdownStartTime = null;
}

function gameOver() {
	const listItem = document.createElement('li');
	const restartButton = document.createElement('button');

	// Odstraní existující event listener, pokud existuje
	document.removeEventListener('keydown', checkEventKey);

	stratagenName.textContent = "Konec hry";

	stratagenSeq.innerHTML = ''; // Vyprázdnění seznamu
	restartButton.classList.add("btn", "btn-sm", "btn-primary", "btn-outline");
	restartButton.textContent = 'Restart';
	restartButton.addEventListener('click', gameRestart);
	listItem.appendChild(restartButton)
	stratagenSeq.appendChild(listItem);

	if (gameSetup.playerStats.playerScore > gameSetup.playerStats.playerScoreBest) {
		gameSetup.playerStats.playerScoreBest = gameSetup.playerStats.playerScore;
		playerScoreBestDisplay.textContent = gameSetup.playerStats.playerScoreBest;
	}

	savePlayerStats();

	console.log("Konečný stav hry:", gameSetup)
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