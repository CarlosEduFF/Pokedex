// Maps a friendly game key to its location inside the PokeAPI `sprites.versions` tree,
// plus the `versionSlug` used to resolve /version/{slug} for the "available in this game" filter.
export const spriteVersionGames = [
	{ value: "red-blue", label: "Red / Blue", generation: "generation-i", game: "red-blue", versionSlug: "red" },
	{ value: "yellow", label: "Yellow", generation: "generation-i", game: "yellow", versionSlug: "yellow" },
	{ value: "gold", label: "Gold", generation: "generation-ii", game: "gold", versionSlug: "gold" },
	{ value: "silver", label: "Silver", generation: "generation-ii", game: "silver", versionSlug: "silver" },
	{ value: "crystal", label: "Crystal", generation: "generation-ii", game: "crystal", versionSlug: "crystal" },
	{
		value: "ruby-sapphire",
		label: "Ruby / Sapphire",
		generation: "generation-iii",
		game: "ruby-sapphire",
		versionSlug: "ruby",
	},
	{ value: "emerald", label: "Emerald", generation: "generation-iii", game: "emerald", versionSlug: "emerald" },
	{
		value: "firered-leafgreen",
		label: "FireRed / LeafGreen",
		generation: "generation-iii",
		game: "firered-leafgreen",
		versionSlug: "firered",
	},
	{
		value: "diamond-pearl",
		label: "Diamond / Pearl",
		generation: "generation-iv",
		game: "diamond-pearl",
		versionSlug: "diamond",
	},
	{ value: "platinum", label: "Platinum", generation: "generation-iv", game: "platinum", versionSlug: "platinum" },
	{
		value: "heartgold-soulsilver",
		label: "HeartGold / SoulSilver",
		generation: "generation-iv",
		game: "heartgold-soulsilver",
		versionSlug: "heartgold",
	},
	{
		value: "black-white",
		label: "Black / White",
		generation: "generation-v",
		game: "black-white",
		versionSlug: "black",
	},
	{ value: "x-y", label: "X / Y", generation: "generation-vi", game: "x-y", versionSlug: "x" },
	{
		value: "omegaruby-alphasapphire",
		label: "Omega Ruby / Alpha Sapphire",
		generation: "generation-vi",
		game: "omegaruby-alphasapphire",
		versionSlug: "omega-ruby",
	},
	{
		value: "ultra-sun-ultra-moon",
		label: "Ultra Sun / Ultra Moon",
		generation: "generation-vii",
		game: "ultra-sun-ultra-moon",
		versionSlug: "ultra-sun",
	},
	{
		value: "brilliant-diamond-shining-pearl",
		label: "Brilliant Diamond / Shining Pearl",
		generation: "generation-viii",
		game: "brilliant-diamond-shining-pearl",
		versionSlug: "brilliant-diamond",
	},
	{
		value: "scarlet-violet",
		label: "Scarlet / Violet",
		generation: "generation-ix",
		game: "scarlet-violet",
		versionSlug: "scarlet",
	},
]

// National Pokédex id ranges per generation, used to infer a pokémon's origin
// generation without an extra API call (species.generation would require one
// request per pokémon shown in a list). Inaccurate only for edge cases such as
// alternate forms/megas whose id falls outside their generation's normal range.
const GENERATION_ID_RANGES = [
	{ generation: "generation-i", maxId: 151 },
	{ generation: "generation-ii", maxId: 251 },
	{ generation: "generation-iii", maxId: 386 },
	{ generation: "generation-iv", maxId: 493 },
	{ generation: "generation-v", maxId: 649 },
	{ generation: "generation-vi", maxId: 721 },
	{ generation: "generation-vii", maxId: 809 },
	{ generation: "generation-viii", maxId: 905 },
	{ generation: "generation-ix", maxId: Infinity },
]

// First game released in each generation, used by "origin generation" mode.
const FIRST_GAME_BY_GENERATION = {
	"generation-i": "red-blue",
	"generation-ii": "gold",
	"generation-iii": "ruby-sapphire",
	"generation-iv": "diamond-pearl",
	"generation-v": "black-white",
	"generation-vi": "x-y",
	"generation-vii": "ultra-sun-ultra-moon",
	"generation-viii": "brilliant-diamond-shining-pearl",
	"generation-ix": "scarlet-violet",
}

export function getOriginGameForPokemon(pokemon) {
	const range = GENERATION_ID_RANGES.find(({ maxId }) => pokemon.id <= maxId)
	const generation = range?.generation ?? "generation-i"
	return FIRST_GAME_BY_GENERATION[generation]
}

export function getGenerationSprite(pokemon, gameValue, { shiny = false, useOriginGeneration = false } = {}) {
	const fallback = shiny ? pokemon.sprites.front_shiny : pokemon.sprites.front_default

	const resolvedGameValue = useOriginGeneration ? getOriginGameForPokemon(pokemon) : gameValue
	if (!resolvedGameValue) return fallback

	const entry = spriteVersionGames.find((option) => option.value === resolvedGameValue)
	if (!entry) return fallback

	const versionSprites = pokemon.sprites.versions?.[entry.generation]?.[entry.game]
	if (!versionSprites) return fallback

	const sprite = shiny ? versionSprites.front_shiny : versionSprites.front_default
	return sprite || fallback
}
