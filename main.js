/*
Importy
*/
import './style.css';
import { arrowIcon } from './assets/js/functions.js';
import { version } from './package.json';

/* 
Promněné
*/
const stratagemsDataPath = './data/stratagems.json';	// Cesta ke Stratagem datům
const stratagenName = document.getElementById('stratagem-name');	// Získání elementu pro jméno stratagemu
const stratagenSeq = document.getElementById('stratagem-seq');	
const gameVersionDisplay = document.getElementById('game-version');
const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

// Nastavení hry
let currentIndex = 0;	// Definice proměnné currentIndex
let gameSetup = {};		// Výchozí nastavení hry (prázdné)
let gameTimerStart = 10;	// Výchozí čas pro časovač

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
      gameTimerStart
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

  startCountdown(gameSetup.gameTimerStart);

  document.addEventListener('keydown', (event) => {
	event.preventDefault();
    const arrowPressed = event.key;

    // Pokud uživatel stiskl klávesu, zkontrolujeme, zda je to správná šipka
    checkArrow(arrowPressed, gameSetup.currentStratagem.activation_sequence);
  });
}

function checkArrow(arrow, sequence) {
  const currentArrow = sequence[currentIndex];
  const currentListItem = document.getElementById('index-' + currentIndex);

  if (arrow === currentArrow) {
	  currentListItem.classList.add('text-green-400'); // Přidání třídy pro zelenou barvu

	  currentIndex++; // Přesun na další šipku v sekvenci

	  console.log('Správná šipka!');

    if (currentIndex === sequence.length) {
      console.log('Gratuluji kadete, úspěšně sis zavolal stratagem! Asi nebudeš taková sračka.');

      currentIndex = 0; // Resetovat index pro další použití

      setTimeout(changeStratagem, 250); // Změna stratagemu po dokončení sekvence
    }
    
  } else {
    stratagenSeq.classList.toggle("animate__headShake");

    // Po určité době (500ms) se odeberte třída "animate__headShake", aby se animace mohla opakovat
    setTimeout(function() {
      stratagenSeq.classList.remove('animate__headShake');
    }, 500);

    console.log('Špatná šipka! Začni makat ty sračko!');
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
  console.log("Nový náhodný stratagem:", gameSetup.currentStratagem);
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}


if (isMobileDevice) {
  const mobileControl = document.getElementById("mobileControl");

  mobileControl.classList.toggle("hidden")
  console.log("Uživatel používá mobilní zařízení.");
} else {
  console.log("Uživatel používá počítač.");
}

// Funkce pro spuštění odpočítávače
function startCountdown(duration) {
  let startTime;
  let progressBar = document.getElementById('countdown');

  function animate(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsedTime = currentTime - startTime;
    const progress = 1 - (elapsedTime / (duration * 1000)); // Plynulý pohyb progress baru
    progressBar.value = Math.max(0, progress) * 100;

    if (progress > 0) {
      requestAnimationFrame(animate);
    } else {
      progressBar.value = 0; // Nastavení na 0% po vypršení času
    }
  }

  requestAnimationFrame(animate);
}
document.querySelectorAll('.kbd').forEach(function(button) {
  button.addEventListener('click', function() {
    var direction = this.getAttribute('data-direction');
    var event = new KeyboardEvent('keydown', {
      key: direction,
      bubbles: true
    });
    document.dispatchEvent(event);
  });
});