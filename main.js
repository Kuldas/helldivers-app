/*
  Importy
*/
import './style.css';  // Import stylů
import { arrowIcon } from './assets/js/functions.js';  // Import funkcí
import { version } from './package.json';  // Import verze hry

/* 
  Promněné
*/
const stratagemsDataPath = './data/stratagems.json';	// Cesta ke Stratagem datům
const stratagenName = document.getElementById('stratagem-name');	// Získání elementu pro jméno stratagemu
const stratagenSeq = document.getElementById('stratagem-seq');  // Získání elementu pro aktivační sekvenci stratagemu
const gameVersionDisplay = document.getElementById('game-version');  // Získání elementu pro verzi hry
const playerScoreDisplay = document.getElementById('player-score'); // Získání elementu pro skóre hráče
const progress = document.getElementById("countdown");  // Získání elementu countdown    
const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);  // Promněná, která kontroluje zda je uživatel na mobilu

// Nastavení hry
let currentIndex = 0;  // Definice proměnné currentIndex
let gameSetup = {};  // Výchozí nastavení hry (prázdné)
let countdownStartTime = null;  // Výchozí čas spuštění countdownu
let countdownDuration = 15000;  // aktuálně: 15sec - Výchozí čas pro countdown (v ms)
let seqBonusTime = 1500; // aktuálně: 1,5sec - Bonusový čas za splněnou sekvenci 
let playerScore = 0;  // Výchozí skóre hráče
let arrowPoints = 5;  // Počet bodů za správnou šipku v sekvenci
let seqPoints = 10;  // Počet bodů za dokončení sekvence stratagemu
let gameStarted = false; // Indikátor, zda byla hra spuštěna
let gameEnded = false; // Indikátor, zda byla hra ukončena

/*
  HRA
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
      gameStarted,
      playerScore
    };
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

  playerScoreDisplay.textContent = gameSetup.playerScore;

  // Přidání nového event listeneru na dokument
  document.addEventListener('keydown', keyUpHandler);
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

function keyUpHandler(event) {
  
  const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  const arrowPressed = event.key;
  
  // Pokud uživatel stiskl klávesu, zkontrolujeme, zda je to správná šipka
  if (arrowKeys.includes(arrowPressed)) {
    event.preventDefault();



    checkArrow(arrowPressed, gameSetup.currentStratagem.activation_sequence);
  }
}

function checkArrow(arrow, sequence) {
  const currentArrow = sequence[currentIndex];
  const currentListItem = document.getElementById('index-' + currentIndex);

  if (arrow === currentArrow) {
	  currentListItem.classList.add('text-primary'); // Přidání třídy pro zelenou barvu

	  currentIndex++; // Přesun na další šipku v sekvenci

    gameSetup.playerScore = gameSetup.playerScore + arrowPoints;
    playerScoreDisplay.textContent = gameSetup.playerScore;

    console.log(gameSetup.playerScore);
	  console.log('Správná šipka!');

    if (currentIndex === sequence.length) {
      console.log('Gratuluji kadete, úspěšně sis zavolal stratagem! Asi nebudeš taková sračka.');

      gameSetup.playerScore = gameSetup.playerScore + seqPoints;
      playerScoreDisplay.textContent = gameSetup.playerScore;

      countdownStartTime += seqBonusTime;

      currentIndex = 0; // Resetovat index pro další použití
      
      setTimeout(changeStratagem, 250); // Změna stratagemu po dokončení sekvence
    }

    if (!gameSetup.gameStarted) {
      startCountdown(countdownDuration);
      gameSetup.gameStarted = true;
    }
    
  } else {
    stratagenSeq.classList.add("animate__headShake");

    if (gameSetup.playerScore > 0) gameSetup.playerScore = gameSetup.playerScore - arrowPoints;
    playerScoreDisplay.textContent = gameSetup.playerScore;

    // Po určité době (500ms) se odeberte třída "animate__headShake", aby se animace mohla opakovat
    setTimeout(function() {
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
  gameSetup.gameStarted = false;
  gameSetup.playerScore = 0;
  currentIndex = 0;
  gameEnded = false;
  progress.value = "10";
  countdownStartTime = null;
}

function gameOver() {
  const listItem = document.createElement('li');
  const restartButton = document.createElement('button');
  
  // Odstranit existující event listener, pokud existuje
  document.removeEventListener('keydown', keyUpHandler);

  stratagenName.textContent = "Konec hry";
  
  stratagenSeq.innerHTML = ''; // Vyprázdnění seznamu
  restartButton.classList.add("btn", "btn-sm", "btn-primary", "btn-outline");
  restartButton.textContent = 'Restart';
  restartButton.addEventListener('click', gameRestart);
  listItem.appendChild(restartButton)
  stratagenSeq.appendChild(listItem);
  
  gameEnded = true; // Nastavení stavu hry na ukončený
  
  console.log("Konečný stav hry:", gameSetup)
}

/*
  Pro mobil
*/

if (isMobileDevice) {
  const mobileControlContainer = document.getElementById("mobileControl");
  const mobileControl = document.querySelectorAll('.kbd');

  mobileControlContainer.classList.toggle("hidden")
  mobileControl.forEach(arrow => {
    arrow.addEventListener('click', function() {
      let direction = this.getAttribute('data-direction');
      let event = new KeyboardEvent('keyup', { key: direction });
      keyUpHandler(event);
    });
  });
  console.log("Uživatel používá mobilní zařízení.");
} else {
  console.log("Uživatel používá počítač.");
}