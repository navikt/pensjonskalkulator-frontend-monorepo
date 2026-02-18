import { BodyShort, Select } from '@navikt/ds-react'

const maanedNavn = [
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

interface MaanedOption {
	value: number
	label: string
}

function getMaanedOptions(foedselsMaaned?: number): MaanedOption[] {
	const startMaaned = foedselsMaaned ?? 0
	return Array.from({ length: 12 }, (_, i) => {
		const maaned = (startMaaned + i) % 12
		return {
			value: maaned,
			label: `${maaned} md. (${maanedNavn[maaned]})`,
		}
	})
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
	foedselsMaaned?: number
	minAar?: number
	maxAar?: number
}

export const AlderVelger = ({
	alderAar,
	alderMd,
	onAlderAarChange,
	onAlderMdChange,
	aarLabel = 'Alder (år) for uttak',
	mdLabel = 'Alder (md.) for uttak',
	foedselsdato,
	foedselsMaaned,
	minAar = 62,
	maxAar = 75,
}: AlderVelgerProps) => {
	const aarOptions = Array.from(
		{ length: maxAar - minAar + 1 },
		(_, i) => minAar + i
	)
	const maanedOptions = getMaanedOptions(foedselsMaaned)

	const uttaksdato =
		foedselsdato && alderAar !== '' && alderMd !== ''
			? beregnUttaksdato(foedselsdato, Number(alderAar), Number(alderMd))
			: null

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
			<div style={{ display: 'flex', gap: 16 }}>
				<Select
					label={aarLabel}
					size="small"
					value={alderAar}
					onChange={(e) => onAlderAarChange(e.target.value)}
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
					onChange={(e) => onAlderMdChange(e.target.value)}
				>
					<option value="">Velg</option>
					{maanedOptions.map((md) => (
						<option key={md.value} value={String(md.value)}>
							{md.label}
						</option>
					))}
				</Select>
			</div>
			{uttaksdato && <BodyShort size="small">{uttaksdato}</BodyShort>}
		</div>
	)
}
