import { useState } from "react"
import { spriteVersionGames } from "../../constants/spriteVersions"

export function FilterModal({
	allTypes,
	gameFilter,
	setGameFilter,
	typeFilter1,
	setTypeFilter1,
	typeFilter2,
	setTypeFilter2,
	onClose,
}) {
	const [activeTab, setActiveTab] = useState("game")

	return (
		<div className="device-filter-modal-overlay" onClick={onClose}>
			<div className="device-filter-modal" onClick={(event) => event.stopPropagation()}>
				<div className="device-filter-modal-header">
					<p className="device-section-label">Filtros</p>
					<button className="device-back-button" onClick={onClose}>
						Fechar
					</button>
				</div>

				<div className="device-filter-tabs">
					<button
						className={`device-filter-tab${activeTab === "game" ? " active" : ""}`}
						onClick={() => setActiveTab("game")}
					>
						Jogo
					</button>
					<button
						className={`device-filter-tab${activeTab === "type" ? " active" : ""}`}
						onClick={() => setActiveTab("type")}
					>
						Tipo
					</button>
				</div>

				{activeTab === "game" ? (
					<div className="device-filter-tab-content">
						<select
							className="device-version-select"
							value={gameFilter}
							onChange={(event) => setGameFilter(event.target.value)}
						>
							<option value="">Todos os jogos</option>
							{spriteVersionGames.map((option) => (
								<option key={option.value} value={option.versionSlug}>
									{option.label}
								</option>
							))}
						</select>
					</div>
				) : (
					<div className="device-filter-tab-content">
						<label className="device-filter-label">Tipo 1</label>
						<select
							className="device-version-select"
							value={typeFilter1}
							onChange={(event) => setTypeFilter1(event.target.value)}
						>
							<option value="">Nenhum</option>
							{allTypes.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>

						<label className="device-filter-label">Tipo 2</label>
						<select
							className="device-version-select"
							value={typeFilter2}
							onChange={(event) => setTypeFilter2(event.target.value)}
						>
							<option value="">Nenhum</option>
							{allTypes.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
					</div>
				)}
			</div>
		</div>
	)
}
