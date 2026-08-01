import { useMemo, useState } from "react"
import { typeColours } from "../../constants/typeColours"
import { usePokemonSearch } from "../../hooks/usePokemonSearch"
import { getTeamTypeCoverage } from "../../constants/teamTypeCoverage"
import { gameOptions } from "../../constants/versionGenerations"
import { getGenerationSprite } from "../../constants/spriteVersions"

export function TeamBuilderScreen({
	pokemonRefs,
	pokemons,
	fetchByName,
	hasMore,
	loadMore,
	spriteGame,
	useOriginGeneration,
	teams,
	activeTeam,
	activeTeamId,
	setActiveTeamId,
	team,
	addToTeam,
	removeFromTeam,
	isInTeam,
	isFull,
	createNewTeam,
	renameTeam,
	setTeamGame,
	deleteTeam,
	onBackToMenu,
}) {
	const [query, setQuery] = useState("")
	const searchResults = usePokemonSearch(query, pokemonRefs, pokemons, fetchByName)

	const coverage = useMemo(() => getTeamTypeCoverage(team), [team])

	function handleCreateTeam() {
		const name = window.prompt("Nome do novo time:", "Novo time")
		if (name === null) return
		createNewTeam(name.trim() || "Novo time", null)
	}

	function handleDeleteTeam() {
		if (teams.length <= 1) return
		if (!window.confirm(`Excluir o time "${activeTeam.name}"?`)) return
		deleteTeam(activeTeam.id)
	}

	function handleListScroll(event) {
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

					<ul className="device-pokemon-list" onScroll={handleListScroll}>
						{searchResults.map((pokemon) => (
							<li
								key={pokemon.id}
								className={`device-pokemon-list-item${
									isInTeam(pokemon.name) ? " selected" : ""
								}`}
								onClick={() => addToTeam(pokemon)}
								title={isInTeam(pokemon.name) ? "Já está no time" : "Adicionar ao time"}
							>
								<img
									src={getGenerationSprite(pokemon, spriteGame, { useOriginGeneration })}
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
					<div className="device-team-screen">
						<div className="device-team-selector">
							<select
								className="device-version-select"
								value={activeTeamId}
								onChange={(event) => setActiveTeamId(event.target.value)}
							>
								{teams.map((t) => (
									<option key={t.id} value={t.id}>
										{t.name}
										{t.game ? ` (${t.game.replace(/-/g, " ")})` : ""}
									</option>
								))}
							</select>
							<button className="device-team-selector-button" onClick={handleCreateTeam}>
								+ Novo
							</button>
							<button
								className="device-team-selector-button device-team-selector-button--danger"
								onClick={handleDeleteTeam}
								disabled={teams.length <= 1}
							>
								Excluir
							</button>
						</div>

						<div className="device-team-meta">
							<input
								type="text"
								className="device-search"
								value={activeTeam.name}
								onChange={(event) => renameTeam(activeTeam.id, event.target.value)}
								placeholder="Nome do time"
							/>
							<select
								className="device-version-select"
								value={activeTeam.game ?? ""}
								onChange={(event) => setTeamGame(activeTeam.id, event.target.value)}
							>
								<option value="">Sem jogo associado</option>
								{gameOptions.map((game) => (
									<option key={game} value={game}>
										{game.replace(/-/g, " ")}
									</option>
								))}
							</select>
						</div>

						<p className="device-section-label">Time ({team.length}/6)</p>

						{isFull && (
							<p className="device-empty-hint">Time completo — remova alguém para trocar</p>
						)}

						<ul className="device-team-slots">
							{team.length === 0 && (
								<li className="device-empty-hint">Busque e adicione pokémon ao time</li>
							)}
							{team.map((pokemon) => (
								<li key={pokemon.id} className="device-team-slot">
									<img
										src={getGenerationSprite(pokemon, spriteGame, { useOriginGeneration })}
										alt={pokemon.name}
										className="device-team-slot-sprite"
									/>
									<span className="device-team-slot-name">{pokemon.name}</span>
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
									<button
										className="device-team-slot-remove"
										onClick={() => removeFromTeam(pokemon.name)}
									>
										Remover
									</button>
								</li>
							))}
						</ul>

						{team.length > 0 && (
							<div className="device-team-coverage">
								<p className="device-section-label">Fraquezas do time</p>
								<div className="device-weakness-grid">
									{coverage.offensiveGaps.map(({ type, weakCount }) => (
										<div
											key={type}
											className="device-weakness-cube"
											style={{ background: typeColours[type] || "#777" }}
											title={`${weakCount} membro(s) fraco(s) a ${type}`}
										>
											<span className="device-weakness-cube-type">{type.slice(0, 3)}</span>
											<span className="device-weakness-cube-multiplier">×{weakCount}</span>
										</div>
									))}
									{coverage.offensiveGaps.length === 0 && (
										<p className="device-empty-hint">Nenhuma fraqueza compartilhada</p>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	)
}
