interface Aldersbestemt {
	alderAar: number
}

export function selectByUttakAlder<T extends Aldersbestemt>(
	liste: T[] | null | undefined,
	{
		heltUttakAar,
		gradertUttakAar,
	}: {
		heltUttakAar: number
		gradertUttakAar?: number
	}
): {
	vedHeltUttak: T | null
	vedGradertUttak: T | null
} {
	const vedHeltUttak =
		liste?.find((entry) => entry.alderAar === heltUttakAar) ?? null

	const vedGradertUttak =
		gradertUttakAar === undefined
			? null
			: (liste?.find((entry) => entry.alderAar === gradertUttakAar) ?? null)

	return {
		vedHeltUttak,
		vedGradertUttak,
	}
}
