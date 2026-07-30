const MODEL_BASE_URL = "https://cdn.jsdelivr.net/gh/Pokemon-3D-api/assets@main/models/opt"

export function getModelUrl(id, shiny) {
	return `${MODEL_BASE_URL}/${shiny ? "shiny" : "regular"}/${id}.glb`
}
