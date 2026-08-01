import { useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "pokedex:teams"
const MAX_TEAM_SIZE = 6

function createId() {
	return `team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createTeam(name, game) {
	return { id: createId(), name, game: game || null, memberNames: [] }
}

function loadTeams() {
	try {
		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
		if (Array.isArray(stored) && stored.length > 0) return stored
	} catch {
		// ignore malformed storage
	}
	return [createTeam("Meu time", null)]
}

export function useTeam(fetchByName) {
	const [teams, setTeams] = useState(loadTeams)
	const [activeTeamIdState, setActiveTeamIdState] = useState(() => loadTeams()[0].id)
	const [hydratedMembers, setHydratedMembers] = useState({})

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(teams))
	}, [teams])

	const activeTeam = teams.find((t) => t.id === activeTeamIdState) ?? teams[0]

	useEffect(() => {
		const allNames = Array.from(new Set(teams.flatMap((t) => t.memberNames)))
		if (allNames.length === 0) return

		let cancelled = false

		Promise.all(allNames.map((name) => fetchByName(name))).then((results) => {
			if (cancelled) return
			setHydratedMembers((current) => {
				const next = { ...current }
				results.forEach((detail) => {
					if (detail) next[detail.name] = detail
				})
				return next
			})
		})

		return () => {
			cancelled = true
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [teams])

	const team = useMemo(
		() => (activeTeam?.memberNames ?? []).map((name) => hydratedMembers[name]).filter(Boolean),
		[activeTeam, hydratedMembers]
	)

	const isFull = (activeTeam?.memberNames.length ?? 0) >= MAX_TEAM_SIZE

	function isInTeam(name) {
		return activeTeam?.memberNames.includes(name) ?? false
	}

	function addToTeam(pokemon) {
		if (isFull || isInTeam(pokemon.name)) return false
		setTeams((current) =>
			current.map((t) =>
				t.id === activeTeam.id ? { ...t, memberNames: [...t.memberNames, pokemon.name] } : t
			)
		)
		return true
	}

	function removeFromTeam(name) {
		setTeams((current) =>
			current.map((t) =>
				t.id === activeTeam.id
					? { ...t, memberNames: t.memberNames.filter((n) => n !== name) }
					: t
			)
		)
	}

	function createNewTeam(name, game) {
		const newTeam = createTeam(name || "Novo time", game)
		setTeams((current) => [...current, newTeam])
		setActiveTeamIdState(newTeam.id)
		return newTeam.id
	}

	function renameTeam(teamId, name) {
		setTeams((current) => current.map((t) => (t.id === teamId ? { ...t, name } : t)))
	}

	function setTeamGame(teamId, game) {
		setTeams((current) => current.map((t) => (t.id === teamId ? { ...t, game: game || null } : t)))
	}

	function deleteTeam(teamId) {
		setTeams((current) => {
			const remaining = current.filter((t) => t.id !== teamId)
			const next = remaining.length > 0 ? remaining : [createTeam("Meu time", null)]
			if (teamId === activeTeam?.id) setActiveTeamIdState(next[0].id)
			return next
		})
	}

	return {
		teams,
		activeTeam,
		activeTeamId: activeTeamIdState,
		setActiveTeamId: setActiveTeamIdState,
		team,
		addToTeam,
		removeFromTeam,
		isInTeam,
		isFull,
		createNewTeam,
		renameTeam,
		setTeamGame,
		deleteTeam,
	}
}
