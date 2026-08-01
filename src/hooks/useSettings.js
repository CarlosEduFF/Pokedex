import { useEffect, useState } from "react"

const STORAGE_KEY = "pokedex:settings"

function loadSettings() {
	try {
		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
		return {
			disable3D: Boolean(stored?.disable3D),
			spriteGame: stored?.spriteGame ?? null,
			useOriginGeneration: Boolean(stored?.useOriginGeneration),
		}
	} catch {
		return { disable3D: false, spriteGame: null, useOriginGeneration: false }
	}
}

export function useSettings() {
	const [settings, setSettings] = useState(loadSettings)

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
	}, [settings])

	function setDisable3D(disable3D) {
		setSettings((current) => ({ ...current, disable3D }))
	}

	function setSpriteGame(spriteGame) {
		setSettings((current) => ({ ...current, spriteGame: spriteGame || null }))
	}

	function setUseOriginGeneration(useOriginGeneration) {
		setSettings((current) => ({ ...current, useOriginGeneration }))
	}

	return { ...settings, setDisable3D, setSpriteGame, setUseOriginGeneration }
}
