import { useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "pokedex:favorites"

function loadFavoriteNames() {
	try {
		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
		return Array.isArray(stored) ? stored : []
	} catch {
		return []
	}
}

export function useFavorites(fetchByName) {
	const [names, setNames] = useState(loadFavoriteNames)
	const [favorites, setFavorites] = useState([])

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(names))
	}, [names])

	useEffect(() => {
		if (names.length === 0) {
			setFavorites([])
			return
		}

		let cancelled = false

		Promise.all(names.map((name) => fetchByName(name))).then((results) => {
			if (!cancelled) setFavorites(results.filter(Boolean))
		})

		return () => {
			cancelled = true
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [names])

	const favoriteNames = useMemo(() => new Set(names), [names])

	function isFavorite(name) {
		return favoriteNames.has(name)
	}

	function toggleFavorite(pokemon) {
		setNames((current) =>
			current.includes(pokemon.name)
				? current.filter((name) => name !== pokemon.name)
				: [...current, pokemon.name]
		)
	}

	return { favorites, favoriteNames, toggleFavorite, isFavorite }
}
