import { useEffect, useState } from "react"

export function usePokemonSearch(query, pokemonRefs, pokemons, fetchByName) {
	const [remoteResults, setRemoteResults] = useState([])

	const normalizedQuery = query.trim().toLowerCase()

	const matchingRefs = normalizedQuery
		? pokemonRefs.filter((ref) => ref.name.includes(normalizedQuery)).slice(0, 24)
		: null

	useEffect(() => {
		if (!matchingRefs || matchingRefs.length === 0) {
			setRemoteResults([])
			return
		}

		let cancelled = false

		Promise.all(matchingRefs.map((ref) => fetchByName(ref.name))).then((results) => {
			if (!cancelled) setRemoteResults(results.filter(Boolean))
		})

		return () => {
			cancelled = true
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [normalizedQuery])

	if (!normalizedQuery) return pokemons

	return remoteResults
}
