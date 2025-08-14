/**
 *	Importy
 */
import { createClient } from '@supabase/supabase-js';	// Import Supabase

/**
 *	Promněné 
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetch players from database
 */
export async function fetchLeaderboard() {
	let { data: leaderboard, error } = await supabase
		.from('strathell-leaderboard')
		.select('*')
		.order('playerScoreBest', { ascending: false })
		.order('created_at', { ascending: true })
		.limit(10);

	// odchycení chyby
	if (error) {
		console.error(error);
		return false;
	}

	return leaderboard;
}


/**
 * Insert new player to database
 */
export async function addToLeaderboard(playerName, playerScoreBest) {
	const { data, error } = await supabase
		.from('strathell-leaderboard')
		.insert([
			{ playerName, playerScoreBest },
		])
		.select();

	// odchycení chyby
	if (error) {
		console.error(error.message);
		return false;
	};

	return data;
}