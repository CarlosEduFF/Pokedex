import { useEffect, useRef, useState } from "react"

function speciesIdFromUrl(url) {
	return Number(url.split("/").filter(Boolean).pop())
}

function toEntry(node, details) {
	return {
		name: node.species.name,
		id: speciesIdFromUrl(node.species.url),
		minLevel: details?.min_level ?? null,
		trigger: details?.trigger?.name ?? null,
		item: details?.item?.name ?? null,
	}
}

function flattenChain(node, pathSoFar = []) {
	const entry = toEntry(node, node.evolution_details[0])
	const path = [...pathSoFar, entry]

	if (node.evolves_to.length === 0) {
		return [path]
	}

	return node.evolves_to.flatMap((nextNode) => flattenChain(nextNode, path))
}

export function useEvolutionChain(species) {
	const [chains, setChains] = useState(null)
	const cache = useRef({})

	useEffect(() => {
		if (!species) {
			setChains(null)
			return
		}

		const url = species.evolution_chain.url

		if (cache.current[url]) {
			setChains(cache.current[url])
			return
		}

		let cancelled = false
		setChains(null)

		fetch(url)
			.then((res) => res.json())
			.then((data) => {
				if (cancelled) return
				const flattened = flattenChain(data.chain)
				cache.current[url] = flattened
				setChains(flattened)
			})

		return () => {
			cancelled = true
		}
	}, [species])

	return chains
}
