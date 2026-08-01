import { typeEffectiveness, getTypeMatchups } from "./typeEffectiveness"

const ALL_TYPES = Object.keys(typeEffectiveness)

export function getTeamTypeCoverage(teamPokemons) {
	const perType = {}

	ALL_TYPES.forEach((type) => {
		perType[type] = { weakCount: 0, resistCount: 0, immuneCount: 0, neutralCount: 0 }
	})

	teamPokemons.forEach((pokemon) => {
		const { weaknesses, resistances, immunities } = getTypeMatchups(
			pokemon.types.map((t) => t.type.name)
		)

		const weakTypes = new Set(weaknesses.map((w) => w.type))
		const resistTypes = new Set(resistances.map((r) => r.type))
		const immuneTypes = new Set(immunities)

		ALL_TYPES.forEach((type) => {
			if (weakTypes.has(type)) perType[type].weakCount++
			else if (immuneTypes.has(type)) perType[type].immuneCount++
			else if (resistTypes.has(type)) perType[type].resistCount++
			else perType[type].neutralCount++
		})
	})

	const offensiveGaps = ALL_TYPES.map((type) => ({ type, ...perType[type] }))
		.filter((entry) => entry.weakCount > 0)
		.sort((a, b) => b.weakCount - a.weakCount)

	return { perType, offensiveGaps }
}
