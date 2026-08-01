import { useState } from "react"
import { typeColours } from "../../constants/typeColours"
import { usePokemonSearch } from "../../hooks/usePokemonSearch"
import { getTypeMatchups } from "../../constants/typeEffectiveness"
import { getGenerationSprite } from "../../constants/spriteVersions"

function ComparisonColumn({ pokemon, spriteGame, useOriginGeneration }) {
	if (!pokemon) {
		return (
			<div className="device-compare-column device-compare-column--empty">
				<p className="device-empty-hint">Selecione um pokémon</p>
			</div>
		)
	}

	const matchups = getTypeMatchups(pokemon.types.map((t) => t.type.name))

	return (
		<div className="device-compare-column">
			<img
				src={getGenerationSprite(pokemon, spriteGame, { useOriginGeneration })}
				alt={pokemon.name}
				className="device-compare-sprite"
			/>
			<p className="device-pokemon-name">{pokemon.name}</p>

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

			<div className="device-stats">
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

			{matchups.weaknesses.length > 0 && (
				<div className="device-weaknesses">
					<p className="device-section-label">Fraquezas</p>
					<div className="device-weakness-grid">
						{matchups.weaknesses.map(({ type, multiplier }) => (
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
		</div>
	)
}

export function CompareScreen({
	pokemonRefs,
	pokemons,
	fetchByName,
	hasMore,
	loadMore,
	spriteGame,
	useOriginGeneration,
	onBackToMenu,
}) {
	const [query, setQuery] = useState("")
	const [pokemonA, setPokemonA] = useState(null)
	const [pokemonB, setPokemonB] = useState(null)

	const results = usePokemonSearch(query, pokemonRefs, pokemons, fetchByName)

	function handleListScroll(event) {
		const { scrollTop, scrollHeight, clientHeight } = event.target
		if (scrollHeight - scrollTop - clientHeight < 80) {
			loadMore()
		}
	}

	function handleSelect(pokemon) {
		if (pokemonA?.id === pokemon.id) {
			setPokemonA(null)
			return
		}
		if (pokemonB?.id === pokemon.id) {
			setPokemonB(null)
			return
		}
		if (!pokemonA) {
			setPokemonA(pokemon)
			return
		}
		if (!pokemonB) {
			setPokemonB(pokemon)
			return
		}
		setPokemonA(pokemonB)
		setPokemonB(pokemon)
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
						{results.map((pokemon) => {
							const isA = pokemon.id === pokemonA?.id
							const isB = pokemon.id === pokemonB?.id

							return (
								<li
									key={pokemon.id}
									className={`device-pokemon-list-item${isA || isB ? " selected" : ""}`}
									onClick={() => handleSelect(pokemon)}
									title={isA ? "Pokémon A" : isB ? "Pokémon B" : "Selecionar"}
								>
									<img
										src={getGenerationSprite(pokemon, spriteGame, { useOriginGeneration })}
										alt={pokemon.name}
										loading="lazy"
										className="device-pokemon-list-sprite"
									/>
									{(isA || isB) && (
										<span className="device-compare-badge">{isA ? "A" : "B"}</span>
									)}
								</li>
							)
						})}

						{hasMore && !query && (
							<li className="device-pokemon-list-loading">Carregando...</li>
						)}
					</ul>
				</div>
			</div>

			<div className="device device-page device-page--right">
				<div className="device-panel device-panel--info">
					<div className="device-compare-columns">
						<ComparisonColumn
							pokemon={pokemonA}
							spriteGame={spriteGame}
							useOriginGeneration={useOriginGeneration}
						/>
						<ComparisonColumn
							pokemon={pokemonB}
							spriteGame={spriteGame}
							useOriginGeneration={useOriginGeneration}
						/>
					</div>
				</div>
			</div>
		</>
	)
}
