import { useEffect, useState } from "react"
import { usePokemons } from "./hooks/usePokemons"
import { PokedexDevice } from "./components/PokedexDevice/PokedexDevice"

export function App() {
	const { pokemonRefs, pokemons, hasMore, loadMore, fetchByName } = usePokemons()
	const [selectedPokemon, setSelectedPokemon] = useState(null)

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
			/>

			<footer>
				<p>Desenvolvido por Carlos Eduardo Fernandes Farias</p>
			</footer>
		</div>
	)
}
