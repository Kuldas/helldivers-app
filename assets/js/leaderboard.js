/**
 *	Importy
 */
import '../css/style.css';									// Import stylů
import { version } from '../../package.json';				// Import verze hry
import * as db from './database.js';

/**
 * Promněné
 */
const gameVersionDisplay = document.getElementById('game-version');		// Získání elementu pro verzi hry
const tableContainer = document.querySelector('table tbody');

/**
 * Načtení žebříčku nejlepších helldiverů
*/
db.fetchLeaderboard()
	.then(leaderboard => {
		leaderboard.forEach(player => {
			createNewLeaderboardRow(tableContainer, player);
		})
	})

// Funkce, která vytváří řádek v tabulce "Leaderboard"
function createNewLeaderboardRow(tableContainer, player) {

	const rowCount = tableContainer.querySelectorAll('tr').length;
	const newRow = document.createElement('tr');

	newRow.innerHTML = `
		<th>#${rowCount + 1}</th>
		<td class="text-lg font-bold">${player.playerName}</td>
		<td>${player.playerScoreBest}</td>
	`;

	tableContainer.append(newRow);
}

// Vrací verzi hry pro zobrazení na frontendu
gameVersionDisplay.textContent = "v" + version;