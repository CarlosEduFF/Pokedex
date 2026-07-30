import { useEffect, useRef, useState } from "react"

export function usePokemonEncounters(pokemon) {
	const [encounters, setEncounters] = useState(null)
	const cache = useRef({})

	useEffect(() => {
		if (!pokemon) {
			setEncounters(null)
			return
		}

		if (cache.current[pokemon.name]) {
			setEncounters(cache.current[pokemon.name])
			return
		}

		let cancelled = false
		setEncounters(null)

		fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}/encounters`)
			.then((res) => res.json())
			.then((data) => {
				if (cancelled) return
				cache.current[pokemon.name] = data
				setEncounters(data)
			})

		return () => {
			cancelled = true
		}
	}, [pokemon])

	return encounters
}
