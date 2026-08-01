import { useEffect, useState } from "react"
import { getGenerationSprite } from "../../constants/spriteVersions"
import { useMobileMasterDetail } from "../../hooks/useMobileMasterDetail"
import { PokemonDatasheet } from "./PokemonDatasheet"

export function FavoritesScreen({
	favorites,
	fetchByName,
	isFavorite,
	onToggleFavorite,
	disable3D,
	spriteGame,
	useOriginGeneration,
	onBackToMenu,
}) {
	const [selected, setSelected] = useState(null)

	const { isMobile, dataView, goToDetail, goToList } = useMobileMasterDetail()

	useEffect(() => {
		if (!selected && favorites.length > 0 && !isMobile) {
			setSelected(favorites[0])
			return
		}
		if (selected && !favorites.some((pokemon) => pokemon.name === selected.name)) {
			setSelected(favorites[0] ?? null)
		}
	}, [favorites, selected, isMobile])

	async function selectVariety(name) {
		const detail = await fetchByName(name)
		if (detail) setSelected(detail)
	}

	return (
		<div className="device-book device-book--open" data-view={dataView}>
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
					<ul className="device-pokemon-list">
						{favorites.length === 0 && (
							<li className="device-empty-hint">Nenhum favorito ainda</li>
						)}
						{favorites.map((pokemon) => (
							<li
								key={pokemon.id}
								className={`device-pokemon-list-item${
									pokemon.id === selected?.id ? " selected" : ""
								}`}
								onClick={() => {
										setSelected(pokemon)
										goToDetail()
									}}
							>
								<img
									src={getGenerationSprite(pokemon, spriteGame, { useOriginGeneration })}
									alt={pokemon.name}
									loading="lazy"
									className="device-pokemon-list-sprite"
								/>
							</li>
						))}
					</ul>
				</div>
			</div>

			<div className="device device-page device-page--right">
				{isMobile && (
					<div className="device-mobile-detail-nav">
						<button className="device-back-button device-back-to-list" onClick={goToList}>
							← Voltar
						</button>
						<button className="device-back-to-menu" onClick={onBackToMenu}>
							Menu
						</button>
					</div>
				)}
				<div className="device-panel device-panel--info">
					{!selected ? (
						<p className="device-empty-hint">Selecione um favorito</p>
					) : (
						<PokemonDatasheet
							pokemon={selected}
							onSelectVariety={selectVariety}
							isFavorite={isFavorite(selected.name)}
							onToggleFavorite={onToggleFavorite}
							disable3D={disable3D}
							spriteGame={spriteGame}
							useOriginGeneration={useOriginGeneration}
						/>
					)}
				</div>
			</div>
		</div>
	)
}
