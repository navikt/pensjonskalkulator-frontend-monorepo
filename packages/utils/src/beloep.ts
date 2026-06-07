/**
 * Utilities for building and merging annual payment series
 * Used by both ekstern simulering and intern beregning apps
 */

export type Alder = {
	aar: number
	maaneder: number
}

export type AarligUtbetaling = {
	alder: number
	beloep: number
}

export type AarligUtbetalingStartSlutt = {
	startAlder: Alder
	sluttAlder?: Alder | null
	aarligUtbetaling: number
}

export const parseStartSluttUtbetaling = (
	data: AarligUtbetalingStartSlutt
): AarligUtbetaling[] => {
	const erLivsvarig = !data.sluttAlder

	const { startAlder, sluttAlder, aarligUtbetaling } = data

	// Måneder starter på 0 (januar) og slutter på 11 (desember)
	const MAANEDER_I_AARET = 12
	const MAANEDER_MED_FORSTE_YTELSE = MAANEDER_I_AARET - startAlder.maaneder

	// Andel av sum første år
	const forsteAarAndel = MAANEDER_MED_FORSTE_YTELSE / MAANEDER_I_AARET

	// Siste andel år er bare dersom det ikke er livsvarig
	const MAANEDER_MED_SISTE_YTELSE = (sluttAlder?.maaneder ?? 11) + 1
	const sisteAarAndel = MAANEDER_MED_SISTE_YTELSE / MAANEDER_I_AARET

	const forsteUtbetaling: AarligUtbetaling = {
		alder: startAlder.aar,
		beloep: aarligUtbetaling * forsteAarAndel,
	}

	if (!erLivsvarig && startAlder.aar === sluttAlder!.aar) {
		return [
			{
				alder: startAlder.aar,
				beloep:
					(aarligUtbetaling / MAANEDER_I_AARET) *
					(sluttAlder!.maaneder - startAlder.maaneder + 1),
			},
		]
	}

	if (erLivsvarig) {
		// For livsvarig utbetaling, vis første år med delårsbeløp hvis nødvendig,
		// deretter full utbetaling, og avslutt med Infinity for å indikere livsvarig
		const utbetalinger: AarligUtbetaling[] = [forsteUtbetaling]

		// Legg til neste år med full utbetaling hvis første år er delårsbeløp
		if (forsteAarAndel < 1) {
			utbetalinger.push({
				alder: startAlder.aar + 1,
				beloep: aarligUtbetaling,
			})
		}

		// Legg til Infinity for å indikere livsvarig utbetaling
		utbetalinger.push({
			alder: Infinity,
			beloep: aarligUtbetaling,
		})

		return utbetalinger
	}

	// For tidsavgrenset utbetaling
	const sisteAar = sluttAlder?.aar ?? 0
	const sisteUtbetaling: AarligUtbetaling = {
		alder: sisteAar,
		beloep: aarligUtbetaling * sisteAarAndel,
	}

	const years = Array.from(
		{ length: sisteAar - startAlder.aar + 1 },
		(_, i) => startAlder.aar + i
	)

	const utbetalinger: AarligUtbetaling[] = years.map((year) => {
		if (year === forsteUtbetaling.alder) {
			return forsteUtbetaling
		} else if (year === sisteUtbetaling.alder) {
			return sisteUtbetaling
		} else {
			return {
				alder: year,
				beloep: aarligUtbetaling,
			}
		}
	})

	return utbetalinger
}

/**
 * Expands lifetime payments (those with Infinity) to fill all years up to maxAge.
 * This ensures that when merging, the lifetime payment is added to every year.
 */
const expandLifetimePayments = (
	utbetalinger: AarligUtbetaling[],
	maxAge: number
): AarligUtbetaling[] => {
	const infiniteEntry = utbetalinger.find((u) => u.alder === Infinity)

	if (!infiniteEntry) {
		// No lifetime payment, return as-is
		return utbetalinger
	}

	// Find the last defined age before Infinity
	const finiteEntries = utbetalinger.filter((u) => u.alder !== Infinity)
	const lastDefinedAge = finiteEntries.reduce(
		(max, u) => Math.max(max, u.alder),
		-Infinity
	)

	// If there's no defined age, start from the first entry's age
	const startAge = finiteEntries.length > 0 ? lastDefinedAge + 1 : 0

	// Generate entries for all years from (lastDefinedAge + 1) to maxAge
	const expandedEntries: AarligUtbetaling[] = []
	for (let age = startAge; age <= maxAge; age++) {
		// Only add if not already defined
		if (!utbetalinger.some((u) => u.alder === age)) {
			expandedEntries.push({
				alder: age,
				beloep: infiniteEntry.beloep,
			})
		}
	}

	// Return original entries (excluding Infinity) + expanded entries + Infinity
	return [...finiteEntries, ...expandedEntries, infiniteEntry]
}

export const mergeAarligUtbetalinger = (
	utbetalinger: AarligUtbetaling[][]
): AarligUtbetaling[] => {
	if (utbetalinger.length === 0) {
		return []
	}

	// First, find the maximum age across all series to know how far to expand
	const allUtbetalinger = utbetalinger.flat()
	const maxFiniteAge = allUtbetalinger
		.filter((u) => u.alder !== Infinity)
		.reduce((max, u) => Math.max(max, u.alder), 0)

	// Expand lifetime payments in each series before merging
	const expandedUtbetalinger = utbetalinger.map((serie) =>
		expandLifetimePayments(serie, maxFiniteAge)
	)

	const allExpanded = expandedUtbetalinger.flat()

	// Get all unique years
	const years = [...new Set(allExpanded.map((u) => u.alder))].sort(
		(a, b) => a - b
	)

	// Group by year and sum up the amounts
	return years.map((year) => {
		const beloep = allExpanded
			.filter((u) => u.alder === year)
			.reduce((sum, curr) => sum + curr.beloep, 0)

		return { alder: year, beloep }
	})
}
