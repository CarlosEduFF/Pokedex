import { useEffect, useState } from "react"
import { usePokemons } from "./hooks/usePokemons"
import { useTeam } from "./hooks/useTeam"
import { useFavorites } from "./hooks/useFavorites"
import { useSettings } from "./hooks/useSettings"
import { PokedexDevice } from "./components/PokedexDevice/PokedexDevice"

export function App() {
	const { pokemonRefs, pokemons, hasMore, loadMore, fetchByName } = usePokemons()
	const [selectedPokemon, setSelectedPokemon] = useState(null)

	const {
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
	} = useTeam(fetchByName)
	const { favorites, isFavorite, toggleFavorite } = useFavorites(fetchByName)
	const {
		disable3D,
		setDisable3D,
		spriteGame,
		setSpriteGame,
		useOriginGeneration,
		setUseOriginGeneration,
	} = useSettings()

	useEffect(() => {
		if (!selectedPokemon && pokemons.length > 0) {
			setSelectedPokemon(pokemons[0])
		}
	}, [selectedPokemon, pokemons])

	return (
		<div className="wrapper">
			<h1>Pokédex</h1>

			<PokedexDevice
				pokemonRefs={pokemonRefs}
				pokemons={pokemons}
				selectedPokemon={selectedPokemon}
				onSelect={setSelectedPokemon}
				hasMore={hasMore}
				loadMore={loadMore}
				fetchByName={fetchByName}
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
				favorites={favorites}
				isFavorite={isFavorite}
				toggleFavorite={toggleFavorite}
				disable3D={disable3D}
				setDisable3D={setDisable3D}
				spriteGame={spriteGame}
				setSpriteGame={setSpriteGame}
				useOriginGeneration={useOriginGeneration}
				setUseOriginGeneration={setUseOriginGeneration}
			/>

			<footer>
				<p>Desenvolvido por Carlos Eduardo Fernandes Farias</p>
			</footer>
		</div>
	)
}
