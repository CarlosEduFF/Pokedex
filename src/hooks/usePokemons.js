import { useEffect, useRef, useState } from "react"

const REVEAL_BATCH_SIZE = 24

export function usePokemons() {
	const [pokemonRefs, setPokemonRefs] = useState([])
	const [pokemonDetails, setPokemonDetails] = useState({})
	const [revealCount, setRevealCount] = useState(REVEAL_BATCH_SIZE)
	const detailsCache = useRef({})

	useEffect(() => {
		fetch("https://pokeapi.co/api/v2/pokemon/?limit=2000&offset=0")
			.then((res) => res.json())
			.then((json) => setPokemonRefs(json.results))
	}, [])

	const visibleRefs = pokemonRefs.slice(0, revealCount)

	useEffect(() => {
		const missing = visibleRefs.filter((ref) => !detailsCache.current[ref.name])
		if (missing.length === 0) return

		let cancelled = false

		Promise.all(
			missing.map((ref) => fetch(ref.url).then((res) => res.json()))
		).then((details) => {
			if (cancelled) return

			details.forEach((detail) => {
				detailsCache.current[detail.name] = detail
			})

			setPokemonDetails((current) => {
				const next = { ...current }
				details.forEach((detail) => {
					next[detail.name] = detail
				})
				return next
			})
		})

		return () => {
			cancelled = true
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [revealCount, pokemonRefs])

	const pokemons = visibleRefs
		.map((ref) => pokemonDetails[ref.name])
		.filter(Boolean)

	const hasMore = revealCount < pokemonRefs.length

	function loadMore() {
		if (!hasMore) return
		setRevealCount((current) => current + REVEAL_BATCH_SIZE)
	}

	async function fetchByName(name) {
		if (detailsCache.current[name]) return detailsCache.current[name]

		const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
		if (!res.ok) return null

		const detail = await res.json()
		detailsCache.current[detail.name] = detail
		setPokemonDetails((current) => ({ ...current, [detail.name]: detail }))
		return detail
	}

	return { pokemonRefs, pokemons, hasMore, loadMore, fetchByName }
}
