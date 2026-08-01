import { useEffect, useMemo, useRef, useState } from "react"
import { typeColours } from "../../constants/typeColours"
import { getModelUrl } from "../../utils/pokemon"
import { getVersionGeneration } from "../../constants/versionGenerations"
import { getTypeMatchups } from "../../constants/typeEffectiveness"
import { getGenerationSprite } from "../../constants/spriteVersions"
import { usePokemonSpecies } from "../../hooks/usePokemonSpecies"
import { usePokemonEncounters } from "../../hooks/usePokemonEncounters"
import { useEvolutionChain } from "../../hooks/useEvolutionChain"

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

export function PokemonDatasheet({
	pokemon,
	onSelectVariety,
	onOpenMoves,
	isFavorite,
	onToggleFavorite,
	disable3D,
	spriteGame,
	useOriginGeneration,
}) {
	const [modelFailed, setModelFailed] = useState(false)
	const [viewMode, setViewMode] = useState(disable3D ? "2d" : "3d")
	const [isShiny, setIsShiny] = useState(false)
	const modelRef = useRef(null)
	const audioRef = useRef(null)

	const species = usePokemonSpecies(pokemon)
	const encounters = usePokemonEncounters(pokemon)
	const evolutionChains = useEvolutionChain(species)

	const genus = species?.genera.find((entry) => entry.language.name === "en")?.genus

	const flavorText = species?.flavor_text_entries
		.find((entry) => entry.language.name === "en")
		?.flavor_text.replace(/[\n\f]/g, " ")

	const typeMatchups = useMemo(() => {
		if (!pokemon) return null
		return getTypeMatchups(pokemon.types.map((t) => t.type.name))
	}, [pokemon])

	const genderInfo = useMemo(() => {
		if (!species) return null
		if (species.gender_rate === -1) return "Sem gênero"
		const femaleChance = (species.gender_rate / 8) * 100
		const maleChance = 100 - femaleChance
		return `${maleChance}% macho / ${femaleChance}% fêmea`
	}, [species])

	useEffect(() => {
		setIsShiny(false)
		audioRef.current?.pause()
	}, [pokemon?.id])

	useEffect(() => {
		if (disable3D) setViewMode("2d")
	}, [disable3D])

	const defaultVariety = species?.varieties.find((variety) => variety.is_default)
	const varieties = species?.varieties.filter((variety) => !variety.is_default) ?? []

	useEffect(() => {
		setModelFailed(false)
	}, [pokemon?.id, isShiny])

	useEffect(() => {
		const modelViewer = modelRef.current
		if (!modelViewer) return

		function handleError() {
			setModelFailed(true)
		}

		modelViewer.addEventListener("error", handleError)
		return () => modelViewer.removeEventListener("error", handleError)
	}, [pokemon?.id, isShiny])

	const cryUrl = pokemon.cries?.latest ?? pokemon.cries?.legacy

	function playCry() {
		if (!cryUrl) return
		audioRef.current?.pause()
		audioRef.current = new Audio(cryUrl)
		audioRef.current.play()
	}

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

	return (
		<>
			<div className="device-thumbnail">
				{viewMode === "2d" || modelFailed || disable3D ? (
					<img
						src={getGenerationSprite(pokemon, spriteGame, { shiny: isShiny, useOriginGeneration })}
						alt={pokemon.name}
						className="device-thumbnail-sprite"
					/>
				) : (
					<model-viewer
						ref={modelRef}
						key={`${pokemon.id}-${isShiny}`}
						class="device-thumbnail-model"
						src={getModelUrl(pokemon.id, isShiny)}
						alt={pokemon.name}
						camera-controls
						disable-zoom
						loading="lazy"
					/>
				)}

				<div className="device-thumbnail-controls">
					{!modelFailed && !disable3D && (
						<div className="device-view-toggle">
							<button
								className={`device-view-toggle-button${viewMode === "3d" ? " active" : ""}`}
								onClick={() => setViewMode("3d")}
							>
								3D
							</button>
							<button
								className={`device-view-toggle-button${viewMode === "2d" ? " active" : ""}`}
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

					<button
						className="device-cry-button"
						onClick={playCry}
						disabled={!cryUrl}
						title="Tocar grito"
					>
						🔊
					</button>
				</div>
			</div>

			<div className="device-datasheet">
				<div className="device-datasheet-header">
					<button
						className={`device-favorite-toggle${isFavorite ? " active" : ""}`}
						onClick={() => onToggleFavorite(pokemon)}
						title="Favoritar"
					>
						{isFavorite ? "★" : "☆"}
					</button>
					<p className="device-pokemon-name">{pokemon.name}</p>
					<p className="device-pokemon-id">#{String(pokemon.id).padStart(3, "0")}</p>
					{onOpenMoves && (
						<button className="device-moves-button" onClick={onOpenMoves}>
							Moves
						</button>
					)}
				</div>

				{genus && <p className="device-genus">{genus}</p>}

				{species && (species.is_legendary || species.is_mythical) && (
					<div className="device-badges">
						{species.is_legendary && (
							<span className="device-badge device-badge--legendary">⭐ Legendário</span>
						)}
						{species.is_mythical && (
							<span className="device-badge device-badge--mythical">✦ Mítico</span>
						)}
					</div>
				)}

				{flavorText && <p className="device-flavor-text">{flavorText}</p>}

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
						value={pokemon.name}
						onChange={(event) => onSelectVariety(event.target.value)}
					>
						<option value={defaultVariety.pokemon.name}>Padrão</option>
						{varieties.map((variety) => (
							<option key={variety.pokemon.name} value={variety.pokemon.name}>
								{variety.pokemon.name.replace(`${species.name}-`, "").replace(/-/g, " ")}
							</option>
						))}
					</select>
				)}

				<div className="device-types">
					{pokemon.types.map(({ type }) => (
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
						<span className="device-metric-value">{(pokemon.height / 10).toFixed(1)} m</span>
					</div>
					<div className="device-metric">
						<span className="device-metric-label">Peso</span>
						<span className="device-metric-value">{(pokemon.weight / 10).toFixed(1)} kg</span>
					</div>
					<div className="device-metric">
						<span className="device-metric-label">Exp. Base</span>
						<span className="device-metric-value">{pokemon.base_experience ?? "—"}</span>
					</div>
				</div>

				{species && (
					<div className="device-metrics">
						<div className="device-metric">
							<span className="device-metric-label">Taxa de Captura</span>
							<span className="device-metric-value">{species.capture_rate}/255</span>
						</div>
						<div className="device-metric">
							<span className="device-metric-label">Felicidade</span>
							<span className="device-metric-value">{species.base_happiness}</span>
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
									<span className="device-weakness-cube-type">{type.slice(0, 3)}</span>
									<span className="device-weakness-cube-multiplier">{multiplier}x</span>
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
												<span key={entry.name} className="device-evolution-condition">
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
													entry.name === pokemon.name ? " active" : ""
												}`}
												onClick={() => onSelectVariety(entry.name)}
											>
												<EvolutionSprite id={entry.id} name={entry.name} />
												<span className="device-evolution-name">{entry.name}</span>
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
						{pokemon.abilities.map(({ ability }) => (
							<span key={ability.name} className="device-ability">
								{ability.name.replace("-", " ")}
							</span>
						))}
					</div>
				</div>

				<div className="device-stats">
					<p className="device-section-label">Status base</p>
					{pokemon.stats.map(({ base_stat, stat }) => (
						<div key={stat.name} className="device-stat-row">
							<span className="device-stat-name">{stat.name.replace("-", " ")}</span>
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
								<p className="device-location-version">{version.replace(/-/g, " ")}</p>
								<p className="device-location-row">{locations}</p>
							</div>
						))
					)}
				</div>
			</div>
		</>
	)
}
