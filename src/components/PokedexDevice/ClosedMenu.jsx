export function ClosedMenu({ onSelectMenu }) {
	return (
		<div className="device-menu">
			<button className="device-menu-item" onClick={() => onSelectMenu("pokedex")}>
				Pokédex
			</button>
			<button className="device-menu-item" onClick={() => onSelectMenu("team")}>
				Team Builder
			</button>
			<button className="device-menu-item" onClick={() => onSelectMenu("compare")}>
				Comparar
			</button>
			<button className="device-menu-item" onClick={() => onSelectMenu("favorites")}>
				Favoritos
			</button>
			<button className="device-menu-item" onClick={() => onSelectMenu("settings")}>
				Configurações
			</button>
		</div>
	)
}
