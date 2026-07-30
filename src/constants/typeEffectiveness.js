export const typeEffectiveness = {
	normal: { weakTo: ["fighting"], resistantTo: [], immuneTo: ["ghost"] },
	fire: {
		weakTo: ["water", "ground", "rock"],
		resistantTo: ["fire", "grass", "ice", "bug", "steel", "fairy"],
		immuneTo: [],
	},
	water: {
		weakTo: ["electric", "grass"],
		resistantTo: ["fire", "water", "ice", "steel"],
		immuneTo: [],
	},
	electric: {
		weakTo: ["ground"],
		resistantTo: ["electric", "flying", "steel"],
		immuneTo: [],
	},
	grass: {
		weakTo: ["fire", "ice", "poison", "flying", "bug"],
		resistantTo: ["water", "electric", "grass", "ground"],
		immuneTo: [],
	},
	ice: {
		weakTo: ["fire", "fighting", "rock", "steel"],
		resistantTo: ["ice"],
		immuneTo: [],
	},
	fighting: {
		weakTo: ["flying", "psychic", "fairy"],
		resistantTo: ["bug", "rock", "dark"],
		immuneTo: [],
	},
	poison: {
		weakTo: ["ground", "psychic"],
		resistantTo: ["grass", "fighting", "poison", "bug", "fairy"],
		immuneTo: [],
	},
	ground: {
		weakTo: ["water", "grass", "ice"],
		resistantTo: ["poison", "rock"],
		immuneTo: ["electric"],
	},
	flying: {
		weakTo: ["electric", "ice", "rock"],
		resistantTo: ["grass", "fighting", "bug"],
		immuneTo: ["ground"],
	},
	psychic: {
		weakTo: ["bug", "ghost", "dark"],
		resistantTo: ["fighting", "psychic"],
		immuneTo: [],
	},
	bug: {
		weakTo: ["fire", "flying", "rock"],
		resistantTo: ["grass", "fighting", "ground"],
		immuneTo: [],
	},
	rock: {
		weakTo: ["water", "grass", "fighting", "ground", "steel"],
		resistantTo: ["normal", "fire", "poison", "flying"],
		immuneTo: [],
	},
	ghost: {
		weakTo: ["ghost", "dark"],
		resistantTo: ["poison", "bug"],
		immuneTo: ["normal", "fighting"],
	},
	dragon: {
		weakTo: ["ice", "dragon", "fairy"],
		resistantTo: ["fire", "water", "electric", "grass"],
		immuneTo: [],
	},
	dark: {
		weakTo: ["fighting", "bug", "fairy"],
		resistantTo: ["ghost", "dark"],
		immuneTo: ["psychic"],
	},
	steel: {
		weakTo: ["fire", "fighting", "ground"],
		resistantTo: [
			"normal",
			"grass",
			"ice",
			"flying",
			"psychic",
			"bug",
			"rock",
			"dragon",
			"steel",
			"fairy",
		],
		immuneTo: ["poison"],
	},
	fairy: {
		weakTo: ["poison", "steel"],
		resistantTo: ["fighting", "bug", "dark"],
		immuneTo: ["dragon"],
	},
}

export function getTypeMatchups(types) {
	const multipliers = {}

	Object.keys(typeEffectiveness).forEach((attackingType) => {
		multipliers[attackingType] = 1
	})

	types.forEach((defendingType) => {
		const rules = typeEffectiveness[defendingType]
		if (!rules) return

		rules.weakTo.forEach((attackingType) => {
			multipliers[attackingType] *= 2
		})
		rules.resistantTo.forEach((attackingType) => {
			multipliers[attackingType] *= 0.5
		})
		rules.immuneTo.forEach((attackingType) => {
			multipliers[attackingType] *= 0
		})
	})

	const weaknesses = []
	const resistances = []
	const immunities = []

	Object.entries(multipliers).forEach(([type, multiplier]) => {
		if (multiplier === 0) immunities.push(type)
		else if (multiplier > 1) weaknesses.push({ type, multiplier })
		else if (multiplier < 1) resistances.push({ type, multiplier })
	})

	weaknesses.sort((a, b) => b.multiplier - a.multiplier)
	resistances.sort((a, b) => a.multiplier - b.multiplier)

	return { weaknesses, resistances, immunities }
}
