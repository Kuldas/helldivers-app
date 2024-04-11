import './style.css';
import { arrowIcon } from './assets/js/functions.js';

const filePath = './data/stratagems.json';

const stratagenName = document.getElementById('stratagem-name');
const stratagenSeq = document.getElementById('stratagem-seq');
const gameVersionDisplay = document.getElementById('game-version');
const gameVersion = "0.1.0";

gameVersionDisplay.textContent = gameVersion;

let currentIndex = 0; // Definice proměnné currentIndex
let gameSetup = {};

fetch(filePath)
  .then((response) => {
    if (!response.ok) {
      throw new Error('Načítání dat selhalo');
    }
    return response.json();
  })
  .then((data) => {
    const stratagemsData = data;
    // Zde můžete provést jakoukoliv manipulaci s proměnnou stratagemsData
    console.log('Data:', stratagemsData); // nebo provedete jakoukoliv další manipulaci s daty

    gameSetup = {
      stratagems: stratagemsData.stratagems,
      currentStratagem: [],
      captured: null,
      gameTimerStart: 10,
    };
    console.log('Výchozí stav hry:', gameSetup);
    startGame(gameSetup); // Spustíme hru s výchozím nastavením
  })
  .catch((error) => {
    console.error('Chyba při načítání dat:', error);
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

  document.addEventListener('keydown', (event) => {
    const arrowPressed = event.key;

    // Pokud uživatel stiskl klávesu, zkontrolujeme, zda je to správná šipka
    checkArrow(arrowPressed, gameSetup.currentStratagem.activation_sequence);
  });
}

function checkArrow(arrow, sequence) {
  const currentArrow = sequence[currentIndex];
  const currentListItem = document.getElementById('index-' + currentIndex);

  if (arrow === currentArrow) {
    console.log('Správná šipka!');
    currentListItem.classList.add('text-green-400'); // Přidání třídy pro zelenou barvu
    currentIndex++; // Přesun na další šipku v sekvenci
    if (currentIndex === sequence.length) {
      console.log('Gratuluji kadete, úspěšně sis zavolal stratagem! Asi nebudeš taková sračka.');
      // Zde můžete provést další akce po dokončení sekvence, např. získání bodů
      currentIndex = 0; // Resetovat index pro další použití
      changeStratagem(); // Změna stratagemu po dokončení sekvence
    }
  } else {
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
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
