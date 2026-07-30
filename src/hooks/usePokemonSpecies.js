import { useEffect, useRef, useState } from "react"

export function usePokemonSpecies(pokemon) {
	const [species, setSpecies] = useState(null)
	const cache = useRef({})

	useEffect(() => {
		if (!pokemon) {
			setSpecies(null)
			return
		}

		if (cache.current[pokemon.name]) {
			setSpecies(cache.current[pokemon.name])
			return
		}

		let cancelled = false
		setSpecies(null)

		fetch(pokemon.species.url)
			.then((res) => res.json())
			.then((data) => {
				if (cancelled) return
				cache.current[pokemon.name] = data
				setSpecies(data)
			})

		return () => {
			cancelled = true
		}
	}, [pokemon])

	return species
}
