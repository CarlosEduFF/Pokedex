import { useEffect, useState } from "react"

// Cached across the whole app lifetime: game -> Set of species ids available in it.
// Resolving a game costs ~3 API calls (version -> version-group -> pokedex), so this
// cache avoids repeating that work every time the filter is toggled.
const gamePokedexCache = {}

function extractIdFromUrl(url) {
	const match = url.match(/\/(\d+)\/?$/)
	return match ? Number(match[1]) : null
}

async function resolveGamePokedex(versionSlug) {
	if (gamePokedexCache[versionSlug]) return gamePokedexCache[versionSlug]

	const versionRes = await fetch(`https://pokeapi.co/api/v2/version/${versionSlug}`)
	if (!versionRes.ok) return new Set()
	const version = await versionRes.json()

	const groupRes = await fetch(version.version_group.url)
	if (!groupRes.ok) return new Set()
	const versionGroup = await groupRes.json()

	const basePokedex = versionGroup.pokedexes[0]
	if (!basePokedex) return new Set()

	const pokedexRes = await fetch(basePokedex.url)
	if (!pokedexRes.ok) return new Set()
	const pokedex = await pokedexRes.json()

	const ids = new Set(
		pokedex.pokemon_entries
			.map((entry) => extractIdFromUrl(entry.pokemon_species.url))
			.filter(Boolean)
	)

	gamePokedexCache[versionSlug] = ids
	return ids
}

export function useGamePokedex(versionSlug) {
	const [speciesIds, setSpeciesIds] = useState(() => gamePokedexCache[versionSlug] ?? null)
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (!versionSlug) {
			setSpeciesIds(null)
			return
		}

		if (gamePokedexCache[versionSlug]) {
			setSpeciesIds(gamePokedexCache[versionSlug])
			return
		}

		let cancelled = false
		setIsLoading(true)
		setSpeciesIds(null)

		resolveGamePokedex(versionSlug).then((ids) => {
			if (cancelled) return
			setSpeciesIds(ids)
			setIsLoading(false)
		})

		return () => {
			cancelled = true
		}
	}, [versionSlug])

	return { speciesIds, isLoading }
}
