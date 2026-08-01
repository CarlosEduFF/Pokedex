import { spriteVersionGames } from "../../constants/spriteVersions"

export function SettingsScreen({
	disable3D,
	setDisable3D,
	spriteGame,
	setSpriteGame,
	useOriginGeneration,
	setUseOriginGeneration,
	onBackToMenu,
}) {
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

				<div className="device-panel device-panel--list device-settings-summary">
					<p className="device-section-label">Configurações</p>
					<p className="device-empty-hint">
						Ajuste como os pokémon são exibidos em todo o dispositivo.
					</p>
				</div>
			</div>

			<div className="device device-page device-page--right">
				<div className="device-panel device-panel--info">
					<div className="device-settings-screen">
						<div className="device-settings-option">
							<div className="device-settings-option-text">
								<p className="device-section-label">Modelo 3D</p>
								<p className="device-empty-hint">
									Desabilite para exibir sempre o sprite 2D, sem carregar modelos 3D.
								</p>
							</div>
							<label className="device-toggle">
								<input
									type="checkbox"
									checked={disable3D}
									onChange={(event) => setDisable3D(event.target.checked)}
								/>
								<span className="device-toggle-track">
									<span className="device-toggle-thumb" />
								</span>
							</label>
						</div>

						<div className="device-settings-option">
							<div className="device-settings-option-text">
								<p className="device-section-label">Geração de origem</p>
								<p className="device-empty-hint">
									Exibe cada pokémon no sprite do primeiro jogo da geração em que ele foi
									introduzido (ex: Bulbasaur em Red/Blue, Greninja em X/Y).
								</p>
							</div>
							<label className="device-toggle">
								<input
									type="checkbox"
									checked={useOriginGeneration}
									onChange={(event) => setUseOriginGeneration(event.target.checked)}
								/>
								<span className="device-toggle-track">
									<span className="device-toggle-thumb" />
								</span>
							</label>
						</div>

						<div
							className={`device-settings-option device-settings-option--stacked${
								useOriginGeneration ? " device-settings-option--disabled" : ""
							}`}
						>
							<div className="device-settings-option-text">
								<p className="device-section-label">Modo geração (jogo específico)</p>
								<p className="device-empty-hint">
									Exibe o sprite do pokémon como aparecia em um jogo específico. Quando não
									houver sprite disponível para aquele jogo, o sprite atual é usado.
									{useOriginGeneration && " Desative \"Geração de origem\" acima para usar esta opção."}
								</p>
							</div>
							<select
								className="device-version-select"
								value={spriteGame ?? ""}
								onChange={(event) => setSpriteGame(event.target.value)}
								disabled={useOriginGeneration}
							>
								<option value="">Sprite atual (padrão)</option>
								{spriteVersionGames.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
