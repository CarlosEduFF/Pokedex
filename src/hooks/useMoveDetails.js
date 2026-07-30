import { useRef, useState } from "react"

export function useMoveDetails() {
	const [details, setDetails] = useState({})
	const cache = useRef({})
	const pending = useRef(new Set())

	async function loadMoveDetail(name) {
		if (cache.current[name] || pending.current.has(name)) return

		pending.current.add(name)
		const res = await fetch(`https://pokeapi.co/api/v2/move/${name}`)
		const data = await res.json()
		pending.current.delete(name)

		cache.current[name] = data
		setDetails((current) => ({ ...current, [name]: data }))
	}

	return { moveDetails: details, loadMoveDetail }
}
