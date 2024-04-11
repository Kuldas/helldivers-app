import './style.css';
import { arrowIcon, loadStratagemsData } from './assets/js/functions.js';

const stratagems = loadStratagemsData('./assets/data/stratagems.json');
const gameInitSetup = {
  stratagems: [],
  currentStratagem: null,
  captured: null,
  gameTimerStart: 10,
};

let gameSetup = JSON.parse(JSON.stringify(gameInitSetup));

document.addEventListener('DOMContentLoaded', function () {
  const stratagemInfo = document.getElementById('stratagem-info');
  const stratagemName = document.getElementById('stratagem-name');
  const stratagemIcon = document.getElementById('stratagem-icon');
  const activationConsole = document.getElementById('activation-console');
  let currentStratagem;
  let timer;
  let timeRemaining = 10; // Časový limit v sekundách

  // Funkce pro náhodný výběr stratagemu
  function chooseRandomStratagem() {
    const randomIndex = Math.floor(
      Math.random() * stratagems.stratagems.length
    );
    return stratagems.stratagems[randomIndex];
  }

  // Funkce pro zobrazení vybraného stratagemu
  function displayStratagem(stratagem) {
    stratagemName.textContent = stratagem.name;
    stratagem.activation_sequence.forEach((key) => {
      const newListItem = document.createElement('li');
      const arrowIconSvg = arrowIcon(key); // Zde předáváme každou klávesovou zkratku zvlášť

      newListItem.innerHTML = arrowIconSvg;
      stratagemIcon.appendChild(newListItem);
    });

    timeRemaining = 10; // Resetujeme časový limit pro nový stratagem
    startTimer(); // Spustíme časovač
  }

  // Funkce pro spuštění časovače
  function startTimer() {
    timer = setInterval(updateTimer, 1000); // Aktualizujeme čas každou sekundu
  }

  // Funkce pro aktualizaci zobrazení zbývajícího času
  function updateTimer() {
    timeRemaining -= 1;
    if (timeRemaining <= 0) {
      clearInterval(timer); // Zastavíme časovač, pokud vyprší časový limit
      activationConsole.textContent = "Time's up! Try again.";
      setTimeout(() => {
        activationConsole.textContent = 'Press Arrow Keys';
        startNewGame();
      }, 2000); // Počkej 2 sekundy a spusť novou hru
    }
  }

  // Funkce pro ověření, zda hráč stiskl správnou posloupnost kláves
  function checkActivationSequence(event) {
    if (!currentStratagem) return;

    const key = event.key;
    const nextKey = currentStratagem.activation_sequence[0];

    if (key === nextKey) {
      currentStratagem.activation_sequence.shift();
      if (currentStratagem.activation_sequence.length === 0) {
        // Hráč správně aktivoval stratagem
        clearInterval(timer); // Zastavíme časovač
        activationConsole.textContent = 'Stratagem activated!';
        setTimeout(() => {
          activationConsole.textContent = 'Press Arrow Keys';
          startNewGame();
        }, 2000); // Počkej 2 sekundy a spusť novou hru
      } else {
        timeRemaining += 0.2; // Přidáme 0.2 sekundy k časovému limitu
      }
    } else {
      // Hráč stiskl nesprávnou klávesu
      activationConsole.textContent = 'Incorrect sequence! Try again.';
    }
  }

  // Funkce pro spuštění nové hry
  function startNewGame() {
    currentStratagem = chooseRandomStratagem();
    displayStratagem(currentStratagem);
  }

  // Spuštění první hry při načtení stránky
  startNewGame();

  // Naslouchání události stisku kláves
  document.addEventListener('keydown', checkActivationSequence);
});
