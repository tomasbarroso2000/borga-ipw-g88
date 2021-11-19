'use strict';

module.exports = function(data_ext, data_int) {
	
	async function addGame(gameId) {
		const game = await data_ext.getGameById(gameId);
		return data_int.saveGame(game);
	}
	
	return {
		searchGame: data_ext.findGame,
		addGame,
		getPopularGames: data_ext.getPopularGames,
		getGame: data_int.loadGame,
		deleteGame: data_int.deleteGame,
		getAllGames: data_int.listGames
	};
};
