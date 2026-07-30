import { useEffect, useMemo, useRef, useState } from "react"
import { typeColours } from "../../constants/typeColours"
import { getModelUrl } from "../../utils/pokemon"
import { getVersionGeneration } from "../../constants/versionGenerations"
import { getTypeMatchups } from "../../constants/typeEffectiveness"
import { usePokemonSearch } from "../../hooks/usePokemonSearch"
import { usePokemonSpecies } from "../../hooks/usePokemonSpecies"
import { usePokemonEncounters } from "../../hooks/usePokemonEncounters"
import { useEvolutionChain } from "../../hooks/useEvolutionChain"
import { useMoveDetails } from "../../hooks/useMoveDetails"
import "./PokedexDevice.css"

function EvolutionSprite({ id, name }) {
	const [status, setStatus] = useState("loading")

	return (
		<>
			{status === "loading" && (
				<div className="device-evolution-sprite-skeleton" />
			)}
			{status === "error" ? (
				<span className="device-evolution-sprite-error">Indisponível</span>
			) : (
				<img
					src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
					alt={name}
					className="device-evolution-sprite"
					style={{ display: status === "loading" ? "none" : "block" }}
					onLoad={() => setStatus("loaded")}
					onError={() => setStatus("error")}
				/>
			)}
		</>
	)
}


export function PokedexDevice({
	pokemonRefs,
	pokemons,
	selectedPokemon,
	onSelect,
	hasMore,
	loadMore,
	fetchByName,
}) {
	const [isOpen, setIsOpen] = useState(false)
	const [isOpening, setIsOpening] = useState(false)
	const [modelFailed, setModelFailed] = useState(false)
	const [viewMode, setViewMode] = useState("3d")
	const [isShiny, setIsShiny] = useState(false)
	const [screen, setScreen] = useState("info")
	const [versionFilter, setVersionFilter] = useState("")
	const [methodFilter, setMethodFilter] = useState("all")
	const [query, setQuery] = useState("")
	const [expandedMove, setExpandedMove] = useState(null)
	const modelRef = useRef(null)

	const visiblePokemons = usePokemonSearch(query, pokemonRefs, pokemons, fetchByName)
	const species = usePokemonSpecies(selectedPokemon)
	const encounters = usePokemonEncounters(selectedPokemon)
	const evolutionChains = useEvolutionChain(species)
	const { moveDetails, loadMoveDetail } = useMoveDetails()

	function toggleMoveDetail(name) {
		if (expandedMove === name) {
			setExpandedMove(null)
			return
		}
		setExpandedMove(name)
		loadMoveDetail(name)
	}

	const genus = species?.genera.find((entry) => entry.language.name === "en")?.genus

	const flavorText = species?.flavor_text_entries
		.find((entry) => entry.language.name === "en")
		?.flavor_text.replace(/[\n\f]/g, " ")

	const typeMatchups = useMemo(() => {
		if (!selectedPokemon) return null
		return getTypeMatchups(selectedPokemon.types.map((t) => t.type.name))
	}, [selectedPokemon])

	const genderInfo = useMemo(() => {
		if (!species) return null
		if (species.gender_rate === -1) return "Sem gênero"
		const femaleChance = (species.gender_rate / 8) * 100
		const maleChance = 100 - femaleChance
		return `${maleChance}% macho / ${femaleChance}% fêmea`
	}, [species])

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
		setIsShiny(false)
		setExpandedMove(null)
	}, [selectedPokemon?.id])

	const defaultVariety = species?.varieties.find((variety) => variety.is_default)
	const varieties = species?.varieties.filter((variety) => !variety.is_default) ?? []

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

	const evolutionStages = useMemo(() => {
		if (!evolutionChains) return []

		const stages = []
		const maxDepth = Math.max(...evolutionChains.map((chain) => chain.length))

		for (let depth = 0; depth < maxDepth; depth++) {
			const entriesAtDepth = new Map()
			evolutionChains.forEach((chain) => {
				const entry = chain[depth]
				if (entry) entriesAtDepth.set(entry.name, entry)
			})
			stages.push(Array.from(entriesAtDepth.values()))
		}

		return stages
	}, [evolutionChains])

	const locationsByVersion = useMemo(() => {
		if (!encounters) return []

		const groups = {}

		encounters.forEach((encounter) => {
			encounter.version_details.forEach((detail) => {
				const versionName = detail.version.name
				if (!groups[versionName]) groups[versionName] = []
				groups[versionName].push(encounter.location_area.name.replace(/-/g, " "))
			})
		})

		return Object.entries(groups)
			.map(([version, locations]) => ({
				version,
				locations: locations.join(", "),
			}))
			.sort((a, b) => getVersionGeneration(a.version) - getVersionGeneration(b.version))
	}, [encounters])

	function handleListScroll(event) {
		const { scrollTop, scrollHeight, clientHeight } = event.target
		if (scrollHeight - scrollTop - clientHeight < 80) {
			loadMore()
		}
	}

	useEffect(() => {
		setModelFailed(false)
	}, [selectedPokemon?.id, isShiny])

	useEffect(() => {
		const modelViewer = modelRef.current
		if (!modelViewer) return

		function handleError() {
			setModelFailed(true)
		}

		modelViewer.addEventListener("error", handleError)
		return () => modelViewer.removeEventListener("error", handleError)
	}, [selectedPokemon?.id, isShiny])

	function handleOpen() {
		setIsOpening(true)
		setTimeout(() => {
			setIsOpen(true)
		}, 1400)
	}

	if (!isOpen) {
		return (
			<div className="device-book device-book--closing">
				{isOpening && selectedPokemon && (
					<div className="device device-page device-page--right device-page--reveal">
						<div className="device-panel device-panel--info device-panel--preview">
							<div className="device-thumbnail">
								<img
									src={selectedPokemon.sprites.front_default}
									alt={selectedPokemon.name}
									className="device-thumbnail-sprite"
								/>
							</div>
							<p className="device-pokemon-name">{selectedPokemon.name}</p>
						</div>
					</div>
				)}

				<div
					className={`device device-closed${isOpening ? " opening" : ""}`}
					onClick={isOpening ? undefined : handleOpen}
				>
					<div className="device-top">
						<div className="device-lens-big" />
						<div className="device-lens-small device-lens-small--blue" />
						<div className="device-lens-small device-lens-small--red" />
						<div className="device-lens-small device-lens-small--yellow" />
					</div>
					{!isOpening && <p className="device-closed-hint">Clique para abrir</p>}
				</div>
			</div>
		)
	}

	return (
		<div className="device-book device-book--open">
			<div className="device device-page device-page--left">
				<div className="device-top">
					<div className="device-lens-big" />
					<div className="device-lens-small device-lens-small--blue" />
					<div className="device-lens-small device-lens-small--red" />
					<div className="device-lens-small device-lens-small--yellow" />
				</div>

				<div className="device-panel device-panel--list">
					<input
						type="text"
						className="device-search"
						placeholder="Buscar pokémon..."
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						onClick={(event) => event.stopPropagation()}
					/>

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
									src={pokemon.sprites.front_default}
									alt={pokemon.name}
									loading="lazy"
									className="device-pokemon-list-sprite"
								/>
							</li>
						))}

						{hasMore && !query && (
							<li className="device-pokemon-list-loading">Carregando...</li>
						)}
					</ul>
				</div>
			</div>

			<div className="device device-page device-page--right">
				<div className="device-panel device-panel--info">
					{!selectedPokemon ? (
						<p className="device-empty-hint">Selecione um pokémon</p>
					) : screen === "moves" ? (
						<div className="device-moves-screen">
							<div className="device-moves-header">
								<p className="device-pokemon-name">{selectedPokemon.name}</p>
								<button
									className="device-back-button"
									onClick={() => setScreen("info")}
								>
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
									<li className="device-empty-hint">
										Escolha um jogo para ver os golpes
									</li>
								) : filteredMoves.length === 0 ? (
									<li className="device-empty-hint">
										Nenhum golpe encontrado para este filtro
									</li>
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
																		background:
																			typeColours[detail.type.name] || "#777",
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
						<>
							<div className="device-thumbnail">
								{viewMode === "2d" || modelFailed ? (
									<img
										src={
											isShiny
												? selectedPokemon.sprites.front_shiny
												: selectedPokemon.sprites.front_default
										}
										alt={selectedPokemon.name}
										className="device-thumbnail-sprite"
									/>
								) : (
									<model-viewer
										ref={modelRef}
										key={`${selectedPokemon.id}-${isShiny}`}
										class="device-thumbnail-model"
										src={getModelUrl(selectedPokemon.id, isShiny)}
										alt={selectedPokemon.name}
										camera-controls
										disable-zoom
										loading="lazy"
									/>
								)}

								<div className="device-thumbnail-controls">
									{!modelFailed && (
										<div className="device-view-toggle">
											<button
												className={`device-view-toggle-button${
													viewMode === "3d" ? " active" : ""
												}`}
												onClick={() => setViewMode("3d")}
											>
												3D
											</button>
											<button
												className={`device-view-toggle-button${
													viewMode === "2d" ? " active" : ""
												}`}
												onClick={() => setViewMode("2d")}
											>
												2D
											</button>
										</div>
									)}

									<button
										className={`device-shiny-toggle${isShiny ? " active" : ""}`}
										onClick={() => setIsShiny((current) => !current)}
									>
										✨ Shiny
									</button>
								</div>
							</div>

							<div className="device-datasheet">
								<div className="device-datasheet-header">
									<p className="device-pokemon-name">{selectedPokemon.name}</p>
									<p className="device-pokemon-id">
										#{String(selectedPokemon.id).padStart(3, "0")}
									</p>
									<button
										className="device-moves-button"
										onClick={() => setScreen("moves")}
									>
										Moves
									</button>
								</div>

								{genus && <p className="device-genus">{genus}</p>}

								{species && (species.is_legendary || species.is_mythical) && (
									<div className="device-badges">
										{species.is_legendary && (
											<span className="device-badge device-badge--legendary">
												⭐ Legendário
											</span>
										)}
										{species.is_mythical && (
											<span className="device-badge device-badge--mythical">
												✦ Mítico
											</span>
										)}
									</div>
								)}

								{flavorText && (
									<p className="device-flavor-text">{flavorText}</p>
								)}

								{species && (
									<div className="device-metrics">
										<div className="device-metric">
											<span className="device-metric-label">Habitat</span>
											<span className="device-metric-value device-metric-value--small">
												{species.habitat?.name.replace(/-/g, " ") ?? "Desconhecido"}
											</span>
										</div>
										<div className="device-metric">
											<span className="device-metric-label">Cor</span>
											<span className="device-metric-value device-metric-value--small">
												{species.color.name}
											</span>
										</div>
										<div className="device-metric">
											<span className="device-metric-label">Ciclo p/ Chocar</span>
											<span className="device-metric-value device-metric-value--small">
												{species.hatch_counter} ({(species.hatch_counter + 1) * 255} passos)
											</span>
										</div>
									</div>
								)}

								{species && species.egg_groups.length > 0 && (
									<div className="device-egg-groups">
										<p className="device-section-label">Grupo de Ovos</p>
										<div className="device-abilities-list">
											{species.egg_groups.map((group) => (
												<span key={group.name} className="device-ability">
													{group.name.replace(/-/g, " ")}
												</span>
											))}
										</div>
									</div>
								)}

								{varieties.length > 0 && (
									<select
										className="device-variety-select"
										value={selectedPokemon.name}
										onChange={(event) => selectVariety(event.target.value)}
									>
										<option value={defaultVariety.pokemon.name}>Padrão</option>
										{varieties.map((variety) => (
											<option key={variety.pokemon.name} value={variety.pokemon.name}>
												{variety.pokemon.name
													.replace(`${species.name}-`, "")
													.replace(/-/g, " ")}
											</option>
										))}
									</select>
								)}

								<div className="device-types">
									{selectedPokemon.types.map(({ type }) => (
										<p
											key={type.name}
											className="device-type"
											style={{ background: typeColours[type.name] || "#777" }}
										>
											{type.name}
										</p>
									))}
								</div>

								<div className="device-metrics">
									<div className="device-metric">
										<span className="device-metric-label">Altura</span>
										<span className="device-metric-value">
											{(selectedPokemon.height / 10).toFixed(1)} m
										</span>
									</div>
									<div className="device-metric">
										<span className="device-metric-label">Peso</span>
										<span className="device-metric-value">
											{(selectedPokemon.weight / 10).toFixed(1)} kg
										</span>
									</div>
									<div className="device-metric">
										<span className="device-metric-label">Exp. Base</span>
										<span className="device-metric-value">
											{selectedPokemon.base_experience ?? "—"}
										</span>
									</div>
								</div>

								{species && (
									<div className="device-metrics">
										<div className="device-metric">
											<span className="device-metric-label">Taxa de Captura</span>
											<span className="device-metric-value">
												{species.capture_rate}/255
											</span>
										</div>
										<div className="device-metric">
											<span className="device-metric-label">Felicidade</span>
											<span className="device-metric-value">
												{species.base_happiness}
											</span>
										</div>
										<div className="device-metric">
											<span className="device-metric-label">Gênero</span>
											<span className="device-metric-value device-metric-value--small">
												{genderInfo}
											</span>
										</div>
									</div>
								)}

								{typeMatchups.weaknesses.length > 0 && (
									<div className="device-weaknesses">
										<p className="device-section-label">Fraquezas</p>
										<div className="device-weakness-grid">
											{typeMatchups.weaknesses.map(({ type, multiplier }) => (
												<div
													key={type}
													className="device-weakness-cube"
													style={{ background: typeColours[type] || "#777" }}
													title={`${type} ${multiplier}x`}
												>
													<span className="device-weakness-cube-type">
														{type.slice(0, 3)}
													</span>
													<span className="device-weakness-cube-multiplier">
														{multiplier}x
													</span>
												</div>
											))}
										</div>
									</div>
								)}

								<div className="device-evolution">
									<p className="device-section-label">Linha evolutiva</p>
									{!evolutionStages || evolutionStages.length === 0 ? (
										<p className="device-empty-hint">Carregando...</p>
									) : evolutionStages.length === 1 ? (
										<p className="device-empty-hint">Não evolui</p>
									) : (
										<div className="device-evolution-chain">
											{evolutionStages.map((stage, stageIndex) => (
												<div key={stageIndex} className="device-evolution-stage-group">
													{stageIndex > 0 && (
														<div className="device-evolution-arrow">
															{stage.map((entry) => (
																<span
																	key={entry.name}
																	className="device-evolution-condition"
																>
																	{entry.minLevel
																		? `Nv. ${entry.minLevel}`
																		: entry.item
																		? entry.item.replace(/-/g, " ")
																		: entry.trigger?.replace(/-/g, " ") ?? "?"}
																</span>
															))}
															<span>→</span>
														</div>
													)}

													<div className="device-evolution-stage">
														{stage.map((entry) => (
															<button
																key={entry.name}
																className={`device-evolution-sprite-button${
																	entry.name === selectedPokemon.name
																		? " active"
																		: ""
																}`}
																onClick={() => selectVariety(entry.name)}
															>
																<EvolutionSprite id={entry.id} name={entry.name} />
																<span className="device-evolution-name">
																	{entry.name}
																</span>
															</button>
														))}
													</div>
												</div>
											))}
										</div>
									)}
								</div>

								<div className="device-abilities">
									<p className="device-section-label">Habilidades</p>
									<div className="device-abilities-list">
										{selectedPokemon.abilities.map(({ ability }) => (
											<span key={ability.name} className="device-ability">
												{ability.name.replace("-", " ")}
											</span>
										))}
									</div>
								</div>

								<div className="device-stats">
									<p className="device-section-label">Status base</p>
									{selectedPokemon.stats.map(({ base_stat, stat }) => (
										<div key={stat.name} className="device-stat-row">
											<span className="device-stat-name">
												{stat.name.replace("-", " ")}
											</span>
											<span className="device-stat-value">{base_stat}</span>
											<div className="device-stat-bar">
												<div
													className="device-stat-bar-fill"
													style={{ width: `${Math.min(base_stat / 1.55, 100)}%` }}
												/>
											</div>
										</div>
									))}
								</div>

								<div className="device-locations">
									<p className="device-section-label">Onde encontrar</p>
									{!encounters ? (
										<p className="device-empty-hint">Carregando...</p>
									) : locationsByVersion.length === 0 ? (
										<p className="device-empty-hint">
											Não encontrado na natureza (obtido de outra forma)
										</p>
									) : (
										locationsByVersion.map(({ version, locations }) => (
											<div key={version} className="device-location-group">
												<p className="device-location-version">
													{version.replace(/-/g, " ")}
												</p>
												<p className="device-location-row">{locations}</p>
											</div>
										))
									)}
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
