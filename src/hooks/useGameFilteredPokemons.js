import { useEffect, useState } from "react"

// Resolves a Set of species ids (from useGamePokedex) into hydrated pokémon details,
// reusing fetchByName's cache. pokemonRefs is used to map id -> name since the PokeAPI
// list is ordered by id (ref at index `id - 1` corresponds to that id in the vast
// majority of cases, national dex has no gaps up to current generations).
export function useGameFilteredPokemons(speciesIds, pokemonRefs, fetchByName) {
	const [results, setResults] = useState([])

	useEffect(() => {
		if (!speciesIds || speciesIds.size === 0 || pokemonRefs.length === 0) {
			setResults([])
			return
		}

		let cancelled = false

		const names = Array.from(speciesIds)
			.map((id) => pokemonRefs[id - 1]?.name)
			.filter(Boolean)

		Promise.all(names.map((name) => fetchByName(name))).then((details) => {
			if (!cancelled) setResults(details.filter(Boolean))
		})

		return () => {
			cancelled = true
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [speciesIds, pokemonRefs])

	return results
}
