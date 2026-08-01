import { useEffect, useMemo, useState } from "react"
import { typeColours } from "../../constants/typeColours"
import { usePokemonSearch } from "../../hooks/usePokemonSearch"
import { useMoveDetails } from "../../hooks/useMoveDetails"
import { useGamePokedex } from "../../hooks/useGamePokedex"
import { useGameFilteredPokemons } from "../../hooks/useGameFilteredPokemons"
import { getGenerationSprite } from "../../constants/spriteVersions"
import { PokemonDatasheet } from "./PokemonDatasheet"
import { FilterModal } from "./FilterModal"

const ALL_TYPES = Object.keys(typeColours)

export function PokedexScreen({
	pokemonRefs,
	pokemons,
	selectedPokemon,
	onSelect,
	hasMore,
	loadMore,
	fetchByName,
	isFavorite,
	onToggleFavorite,
	disable3D,
	spriteGame,
	useOriginGeneration,
	onBackToMenu,
}) {
	const [screen, setScreen] = useState("info")
	const [versionFilter, setVersionFilter] = useState("")
	const [methodFilter, setMethodFilter] = useState("all")
	const [query, setQuery] = useState("")
	const [expandedMove, setExpandedMove] = useState(null)
	const [gameFilter, setGameFilter] = useState("")
	const [typeFilter1, setTypeFilter1] = useState("")
	const [typeFilter2, setTypeFilter2] = useState("")
	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

	const searchResults = usePokemonSearch(query, pokemonRefs, pokemons, fetchByName)
	const { speciesIds: gameSpeciesIds, isLoading: isGameLoading } = useGamePokedex(gameFilter)
	const gameFilteredPokemons = useGameFilteredPokemons(gameSpeciesIds, pokemonRefs, fetchByName)
	const isGameFilterLoading =
		gameFilter && (isGameLoading || (gameSpeciesIds && gameFilteredPokemons.length < gameSpeciesIds.size))

	const baseList = gameFilter ? gameFilteredPokemons : searchResults

	const visiblePokemons = useMemo(() => {
		if (!typeFilter1 && !typeFilter2) return baseList

		return baseList.filter((pokemon) => {
			const pokemonTypes = pokemon.types.map((t) => t.type.name)
			return (
				(!typeFilter1 || pokemonTypes.includes(typeFilter1)) &&
				(!typeFilter2 || pokemonTypes.includes(typeFilter2))
			)
		})
	}, [baseList, typeFilter1, typeFilter2])

	const activeFilterCount = (gameFilter ? 1 : 0) + (typeFilter1 ? 1 : 0) + (typeFilter2 ? 1 : 0)

	const { moveDetails, loadMoveDetail } = useMoveDetails()

	function toggleMoveDetail(name) {
		if (expandedMove === name) {
			setExpandedMove(null)
			return
		}
		setExpandedMove(name)
		loadMoveDetail(name)
	}

	const versionGroups = useMemo(() => {
		if (!selectedPokemon) return []
		const names = new Set()
		selectedPokemon.moves.forEach((moveEntry) => {
			moveEntry.version_group_details.forEach((detail) => {
				names.add(detail.version_group.name)
			})
		})
		return Array.from(names)
	}, [selectedPokemon])

	useEffect(() => {
		setScreen("info")
		setVersionFilter("")
		setMethodFilter("all")
		setExpandedMove(null)
	}, [selectedPokemon?.id])

	async function selectVariety(name) {
		const detail = await fetchByName(name)
		if (detail) onSelect(detail)
	}

	const movesForVersion = useMemo(() => {
		if (!selectedPokemon || !versionFilter) return []

		return selectedPokemon.moves
			.map((moveEntry) => {
				const detail = moveEntry.version_group_details.find(
					(entry) => entry.version_group.name === versionFilter
				)
				if (!detail) return null
				return {
					name: moveEntry.move.name,
					method: detail.move_learn_method.name,
					level: detail.level_learned_at,
				}
			})
			.filter(Boolean)
			.sort((a, b) => a.level - b.level)
	}, [selectedPokemon, versionFilter])

	const methodFilters = [
		{ value: "all", label: "Todos" },
		{ value: "level-up", label: "Nível" },
		{ value: "machine", label: "TM/HM" },
		{ value: "egg", label: "Ovo" },
		{ value: "tutor", label: "Tutor" },
	]

	const filteredMoves =
		methodFilter === "all"
			? movesForVersion
			: movesForVersion.filter((move) => move.method === methodFilter)

	function handleListScroll(event) {
		if (gameFilter) return
		const { scrollTop, scrollHeight, clientHeight } = event.target
		if (scrollHeight - scrollTop - clientHeight < 80) {
			loadMore()
		}
	}

	return (
		<>
			<div className="device device-page device-page--left">
				<div className="device-top">
					<div className="device-lens-big" />
					<div className="device-lens-small device-lens-small--blue" />
					<div className="device-lens-small device-lens-small--red" />
					<div className="device-lens-small device-lens-small--yellow" />
				</div>

				<button className="device-back-to-menu" onClick={onBackToMenu}>
					Menu
				</button>

				<div className="device-panel device-panel--list">
					<input
						type="text"
						className="device-search"
						placeholder="Buscar pokémon..."
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						onClick={(event) => event.stopPropagation()}
					/>

					<button
						className="device-filter-open-button"
						onClick={() => setIsFilterModalOpen(true)}
					>
						Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
					</button>

					<ul className="device-pokemon-list" onScroll={handleListScroll}>
						{visiblePokemons.map((pokemon) => (
							<li
								key={pokemon.id}
								className={`device-pokemon-list-item${
									pokemon.id === selectedPokemon?.id ? " selected" : ""
								}`}
								onClick={() => onSelect(pokemon)}
							>
								<img
									src={getGenerationSprite(pokemon, spriteGame, { useOriginGeneration })}
									alt={pokemon.name}
									loading="lazy"
									className="device-pokemon-list-sprite"
								/>
							</li>
						))}

						{hasMore && !query && !gameFilter && (
							<li className="device-pokemon-list-loading">Carregando...</li>
						)}

						{isGameFilterLoading && (
							<li className="device-pokemon-list-loading">Carregando pokémon do jogo...</li>
						)}

						{!isGameFilterLoading &&
							visiblePokemons.length === 0 &&
							(query || gameFilter || typeFilter1 || typeFilter2) && (
								<li className="device-empty-hint">Nenhum pokémon encontrado para este filtro</li>
							)}
					</ul>
				</div>

				{isFilterModalOpen && (
					<FilterModal
						allTypes={ALL_TYPES}
						gameFilter={gameFilter}
						setGameFilter={setGameFilter}
						typeFilter1={typeFilter1}
						setTypeFilter1={setTypeFilter1}
						typeFilter2={typeFilter2}
						setTypeFilter2={setTypeFilter2}
						onClose={() => setIsFilterModalOpen(false)}
					/>
				)}
			</div>

			<div className="device device-page device-page--right">
				<div className="device-panel device-panel--info">
					{!selectedPokemon ? (
						<p className="device-empty-hint">Selecione um pokémon</p>
					) : screen === "moves" ? (
						<div className="device-moves-screen">
							<div className="device-moves-header">
								<p className="device-pokemon-name">{selectedPokemon.name}</p>
								<button className="device-back-button" onClick={() => setScreen("info")}>
									Voltar
								</button>
							</div>

							<select
								className="device-version-select"
								value={versionFilter}
								onChange={(event) => {
									setVersionFilter(event.target.value)
									setMethodFilter("all")
								}}
							>
								<option value="">Selecione um jogo...</option>
								{versionGroups.map((group) => (
									<option key={group} value={group}>
										{group.replace(/-/g, " ")}
									</option>
								))}
							</select>

							{versionFilter && (
								<div className="device-method-filters">
									{methodFilters.map((filter) => (
										<button
											key={filter.value}
											className={`device-method-filter-button${
												methodFilter === filter.value ? " active" : ""
											}`}
											onClick={() => setMethodFilter(filter.value)}
										>
											{filter.label}
										</button>
									))}
								</div>
							)}

							<ul className="device-moves-list">
								{!versionFilter ? (
									<li className="device-empty-hint">Escolha um jogo para ver os golpes</li>
								) : filteredMoves.length === 0 ? (
									<li className="device-empty-hint">Nenhum golpe encontrado para este filtro</li>
								) : (
									filteredMoves.map((move) => {
										const detail = moveDetails[move.name]
										const isExpanded = expandedMove === move.name

										return (
											<li key={move.name} className="device-move-item">
												<button
													className="device-move-row"
													onClick={() => toggleMoveDetail(move.name)}
												>
													<span className="device-move-name">
														{move.name.replace(/-/g, " ")}
													</span>
													<span className="device-move-method">
														{move.method === "level-up"
															? `Nv. ${move.level}`
															: move.method.replace(/-/g, " ")}
													</span>
												</button>

												{isExpanded && (
													<div className="device-move-detail">
														{!detail ? (
															<p className="device-empty-hint">Carregando...</p>
														) : (
															<div className="device-move-detail-grid">
																<span>
																	Poder: <b>{detail.power ?? "—"}</b>
																</span>
																<span>
																	Precisão: <b>{detail.accuracy ?? "—"}%</b>
																</span>
																<span>
																	PP: <b>{detail.pp ?? "—"}</b>
																</span>
																<span>
																	Categoria: <b>{detail.damage_class.name}</b>
																</span>
																<span
																	className="device-move-detail-type"
																	style={{
																		background: typeColours[detail.type.name] || "#777",
																	}}
																>
																	{detail.type.name}
																</span>
															</div>
														)}
													</div>
												)}
											</li>
										)
									})
								)}
							</ul>
						</div>
					) : (
						<PokemonDatasheet
							pokemon={selectedPokemon}
							onSelectVariety={selectVariety}
							onOpenMoves={() => setScreen("moves")}
							isFavorite={isFavorite(selectedPokemon.name)}
							onToggleFavorite={onToggleFavorite}
							disable3D={disable3D}
							spriteGame={spriteGame}
							useOriginGeneration={useOriginGeneration}
						/>
					)}
				</div>
			</div>
		</>
	)
}
