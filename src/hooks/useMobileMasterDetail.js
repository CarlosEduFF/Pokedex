import { useState } from "react"
import { useMediaQuery } from "./useMediaQuery"

const MOBILE_QUERY = "(max-width: 640px)"

export function useMobileMasterDetail() {
	const isMobile = useMediaQuery(MOBILE_QUERY)
	const [view, setView] = useState("list")

	function goToDetail() {
		setView("detail")
	}

	function goToList() {
		setView("list")
	}

	const dataView = isMobile ? view : "both"

	return { isMobile, dataView, goToDetail, goToList }
}
