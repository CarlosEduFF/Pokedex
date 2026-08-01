import { useState } from "react"
import { ClosedMenu } from "./ClosedMenu"
import { PokedexScreen } from "./PokedexScreen"
import { TeamBuilderScreen } from "./TeamBuilderScreen"
import { CompareScreen } from "./CompareScreen"
import { FavoritesScreen } from "./FavoritesScreen"
import { SettingsScreen } from "./SettingsScreen"
import "./PokedexDevice.css"

export function PokedexDevice({
	pokemonRefs,
	pokemons,
	selectedPokemon,
	onSelect,
	hasMore,
	loadMore,
	fetchByName,
	teams,
	activeTeam,
	activeTeamId,
	setActiveTeamId,
	team,
	addToTeam,
	removeFromTeam,
	isInTeam,
	isFull,
	createNewTeam,
	renameTeam,
	setTeamGame,
	deleteTeam,
	favorites,
	isFavorite,
	toggleFavorite,
	disable3D,
	setDisable3D,
	spriteGame,
	setSpriteGame,
	useOriginGeneration,
	setUseOriginGeneration,
}) {
	const [isOpen, setIsOpen] = useState(false)
	const [isOpening, setIsOpening] = useState(false)
	const [menuScreen, setMenuScreen] = useState(null)

	function handleOpen(screenKey) {
		setIsOpening(true)
		setMenuScreen(screenKey)
		setTimeout(() => {
			setIsOpen(true)
			setIsOpening(false)
		}, 1400)
	}

	function handleClose() {
		setIsOpen(false)
		setMenuScreen(null)
	}

	if (!isOpen) {
		return (
			<div className="device-book device-book--closing">
				{isOpening && (
					<div className="device device-page device-page--right device-page--reveal">
						<div className="device-panel device-panel--info device-panel--preview">
							{menuScreen === "pokedex" && selectedPokemon ? (
								<>
									<div className="device-thumbnail">
										<img
											src={selectedPokemon.sprites.front_default}
											alt={selectedPokemon.name}
											className="device-thumbnail-sprite"
										/>
									</div>
									<p className="device-pokemon-name">{selectedPokemon.name}</p>
								</>
							) : (
								<p className="device-pokemon-name">
									{menuScreen === "team"
										? "Team Builder"
										: menuScreen === "compare"
										? "Comparar"
										: menuScreen === "favorites"
										? "Favoritos"
										: menuScreen === "settings"
										? "Configurações"
										: "Pokédex"}
								</p>
							)}
						</div>
					</div>
				)}

				<div className={`device device-closed${isOpening ? " opening" : ""}`}>
					<div className="device-top">
						<div className="device-lens-big" />
						<div className="device-lens-small device-lens-small--blue" />
						<div className="device-lens-small device-lens-small--red" />
						<div className="device-lens-small device-lens-small--yellow" />
					</div>
					{!isOpening && <ClosedMenu onSelectMenu={handleOpen} />}
				</div>
			</div>
		)
	}

	return (
		<>
			{menuScreen === "team" ? (
				<TeamBuilderScreen
					pokemonRefs={pokemonRefs}
					pokemons={pokemons}
					fetchByName={fetchByName}
					hasMore={hasMore}
					loadMore={loadMore}
					teams={teams}
					activeTeam={activeTeam}
					activeTeamId={activeTeamId}
					setActiveTeamId={setActiveTeamId}
					team={team}
					addToTeam={addToTeam}
					removeFromTeam={removeFromTeam}
					isInTeam={isInTeam}
					isFull={isFull}
					createNewTeam={createNewTeam}
					renameTeam={renameTeam}
					setTeamGame={setTeamGame}
					deleteTeam={deleteTeam}
					spriteGame={spriteGame}
					useOriginGeneration={useOriginGeneration}
					onBackToMenu={handleClose}
				/>
			) : menuScreen === "compare" ? (
				<CompareScreen
					pokemonRefs={pokemonRefs}
					pokemons={pokemons}
					fetchByName={fetchByName}
					hasMore={hasMore}
					loadMore={loadMore}
					spriteGame={spriteGame}
					useOriginGeneration={useOriginGeneration}
					onBackToMenu={handleClose}
				/>
			) : menuScreen === "favorites" ? (
				<FavoritesScreen
					favorites={favorites}
					fetchByName={fetchByName}
					isFavorite={isFavorite}
					onToggleFavorite={toggleFavorite}
					disable3D={disable3D}
					spriteGame={spriteGame}
					useOriginGeneration={useOriginGeneration}
					onBackToMenu={handleClose}
				/>
			) : menuScreen === "settings" ? (
				<SettingsScreen
					disable3D={disable3D}
					setDisable3D={setDisable3D}
					spriteGame={spriteGame}
					setSpriteGame={setSpriteGame}
					useOriginGeneration={useOriginGeneration}
					setUseOriginGeneration={setUseOriginGeneration}
					onBackToMenu={handleClose}
				/>
			) : (
				<PokedexScreen
					pokemonRefs={pokemonRefs}
					pokemons={pokemons}
					selectedPokemon={selectedPokemon}
					onSelect={onSelect}
					hasMore={hasMore}
					loadMore={loadMore}
					fetchByName={fetchByName}
					isFavorite={isFavorite}
					onToggleFavorite={toggleFavorite}
					disable3D={disable3D}
					spriteGame={spriteGame}
					useOriginGeneration={useOriginGeneration}
					onBackToMenu={handleClose}
				/>
			)}
		</>
	)
}
