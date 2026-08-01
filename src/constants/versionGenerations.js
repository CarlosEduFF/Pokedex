export const versionGeneration = {
	red: 1,
	blue: 1,
	yellow: 1,
	gold: 2,
	silver: 2,
	crystal: 2,
	ruby: 3,
	sapphire: 3,
	emerald: 3,
	"firered": 3,
	"leafgreen": 3,
	diamond: 4,
	pearl: 4,
	platinum: 4,
	"heartgold": 4,
	"soulsilver": 4,
	black: 5,
	white: 5,
	"black-2": 5,
	"white-2": 5,
	x: 6,
	y: 6,
	"omega-ruby": 6,
	"alpha-sapphire": 6,
	sun: 7,
	moon: 7,
	"ultra-sun": 7,
	"ultra-moon": 7,
	"lets-go-pikachu": 7,
	"lets-go-eevee": 7,
	sword: 8,
	shield: 8,
	"brilliant-diamond": 8,
	"shining-pearl": 8,
	"legends-arceus": 8,
	scarlet: 9,
	violet: 9,
}

export function getVersionGeneration(versionName) {
	return versionGeneration[versionName] ?? 99
}

export const gameOptions = Object.keys(versionGeneration).sort(
	(a, b) => versionGeneration[a] - versionGeneration[b] || a.localeCompare(b)
)
