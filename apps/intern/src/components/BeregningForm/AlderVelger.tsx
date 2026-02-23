import { useMemo } from 'react'

import { BodyShort, ErrorMessage, Select } from '@navikt/ds-react'

import styles from './BeregningForm.module.css'

const MAANED_NAVN = [
	'jan.',
	'feb.',
	'mar.',
	'apr.',
	'mai',
	'jun.',
	'jul.',
	'aug.',
	'sep.',
	'okt.',
	'nov.',
	'des.',
]

const MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const

interface AlderGrense {
	aar: number
	maaneder: number
}

function isMonthValidForSelectedYear(
	month: number,
	selectedYear: number | undefined,
	minAlder: AlderGrense,
	maxAlder: AlderGrense
): boolean {
	if (selectedYear === undefined) return false

	if (selectedYear > minAlder.aar && selectedYear < maxAlder.aar) {
		return true
	}

	if (minAlder.aar === maxAlder.aar && selectedYear === minAlder.aar) {
		return month >= minAlder.maaneder && month <= maxAlder.maaneder
	}

	if (selectedYear === minAlder.aar && minAlder.aar !== maxAlder.aar) {
		return month >= minAlder.maaneder
	}

	if (selectedYear === maxAlder.aar && minAlder.aar !== maxAlder.aar) {
		return month <= maxAlder.maaneder
	}

	return false
}

function getFirstValidMonth(
	selectedYear: number,
	minAlder: AlderGrense,
	maxAlder: AlderGrense
): number | undefined {
	return MONTHS.find((m) =>
		isMonthValidForSelectedYear(m, selectedYear, minAlder, maxAlder)
	)
}

function getCalendarMonthName(ageMonth: number, foedselsdato: string): string {
	const birth = new Date(foedselsdato)
	const calendarMonth = (birth.getMonth() + ageMonth + 1) % 12
	return MAANED_NAVN[calendarMonth]
}

function beregnUttaksdato(
	foedselsdato: string,
	alderAar: number,
	alderMd: number
): string {
	const foedsel = new Date(foedselsdato)
	const uttaksDato = new Date(
		foedsel.getFullYear() + alderAar,
		foedsel.getMonth() + alderMd + 1,
		1
	)
	return uttaksDato.toLocaleDateString('nb-NO', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	})
}

interface AlderVelgerProps {
	alderAar: string
	alderMd: string
	onAlderAarChange: (value: string) => void
	onAlderMdChange: (value: string) => void
	aarLabel?: string
	mdLabel?: string
	foedselsdato?: string
	minAlder?: AlderGrense
	maxAlder?: AlderGrense
	aarError?: string
	mdError?: string
}

export const AlderVelger = ({
	alderAar,
	alderMd,
	onAlderAarChange,
	onAlderMdChange,
	aarLabel = 'Alder (år) for uttak',
	mdLabel = 'Alder (md.) for uttak',
	foedselsdato,
	minAlder = { aar: 62, maaneder: 0 },
	maxAlder = { aar: 75, maaneder: 0 },
	aarError,
	mdError,
}: AlderVelgerProps) => {
	const selectedYear = alderAar ? Number(alderAar) : undefined

	const aarOptions = useMemo(() => {
		const arr = []
		for (let i = minAlder.aar; i <= maxAlder.aar; i++) {
			arr.push(i)
		}
		return arr
	}, [minAlder.aar, maxAlder.aar])

	const uttaksdato =
		foedselsdato && alderAar !== '' && alderMd !== ''
			? beregnUttaksdato(foedselsdato, Number(alderAar), Number(alderMd))
			: null

	const errorMessage = aarError || mdError

	return (
		<div>
			<div className={styles.alderRow}>
				<Select
					label={aarLabel}
					size="small"
					value={alderAar}
					error={!!aarError}
					onChange={(e) => {
						const value = e.target.value
						onAlderAarChange(value)

						if (value) {
							const year = Number(value)
							const firstValid = getFirstValidMonth(year, minAlder, maxAlder)
							onAlderMdChange(
								firstValid !== undefined ? String(firstValid) : ''
							)
						} else {
							onAlderMdChange('')
						}
					}}
				>
					<option value="">Velg</option>
					{aarOptions.map((aar) => (
						<option key={aar} value={String(aar)}>
							{aar} år
						</option>
					))}
				</Select>
				<Select
					label={mdLabel}
					size="small"
					value={alderMd}
					error={!!mdError}
					disabled={!alderAar}
					onChange={(e) => onAlderMdChange(e.target.value)}
				>
					{MONTHS.map((month) =>
						isMonthValidForSelectedYear(
							month,
							selectedYear,
							minAlder,
							maxAlder
						) ? (
							<option key={month} value={String(month)}>
								{month} md.
								{foedselsdato
									? ` (${getCalendarMonthName(month, foedselsdato)})`
									: ''}
							</option>
						) : null
					)}
				</Select>
			</div>
			{errorMessage && (
				<ErrorMessage size="small" showIcon>
					{errorMessage}
				</ErrorMessage>
			)}
			{uttaksdato && (
				<BodyShort size="small" textColor="subtle">
					{uttaksdato}
				</BodyShort>
			)}
		</div>
	)
}
