import { useEffect, useState } from "react"

export function useMediaQuery(query) {
	const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

	useEffect(() => {
		const mediaQueryList = window.matchMedia(query)
		function handleChange(event) {
			setMatches(event.matches)
		}

		mediaQueryList.addEventListener("change", handleChange)
		setMatches(mediaQueryList.matches)

		return () => mediaQueryList.removeEventListener("change", handleChange)
	}, [query])

	return matches
}
