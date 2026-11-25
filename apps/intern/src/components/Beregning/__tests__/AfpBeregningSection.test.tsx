import type {
	LivsvarigOffentligAFP,
	TidsbegrensetOffentligAFP,
} from '@pensjonskalkulator-frontend-monorepo/types'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { BeregningSection } from '../../BeregningSection/BeregningSection'
import { AfpBeregningSection } from '../AfpBeregningSection'

const vilkaarsproevingsresultat = vi.hoisted(() => ({
	livsvarigOffentligAfpHarBetydningForInnvilgelse: undefined as
		| boolean
		| null
		| undefined,
}))

vi.mock('../../BeregningContext', () => ({
	useBeregningContext: () => ({
		aktivBeregning: { epsHarPensjon: false },
		beregning: { vilkaarsproevingsresultat },
	}),
}))

vi.mock('../../../api/queries', () => ({
	useFeatureToggleQuery: () => ({ data: { enabled: false } }),
}))

afterEach(() => {
	vilkaarsproevingsresultat.livsvarigOffentligAfpHarBetydningForInnvilgelse =
		undefined
})

const livsvarigEntry: LivsvarigOffentligAFP = {
	alderAar: 65,
	maanedligBeloep: 8347,
	aarligBeloep: 100164,
}

const estimertAfpBeskrivelse =
	'AFP-beløpet er estimert av Nav og innebærer ikke en vurdering eller bekreftelse av rett til AFP.'

const tidsbegrensetEntry: TidsbegrensetOffentligAFP = {
	alderAar: 65,
	totaltAfpBeloep: 15285,
	tidligereArbeidsinntekt: 550000,
	grunnbeloep: 124028,
	sluttpoengtall: 4.12,
	trygdetid: 40,
	poengaarTom1991: 12,
	poengaarFom1992: 28,
	grunnpensjon: 6600,
	tilleggspensjon: 5200,
	afpTillegg: 3100,
	saertillegg: 385,
	afpGrad: 100,
	erAvkortet: true,
	fremtidigePensjonspoeng: 4,
}

describe('BeregningSection med privat AFP', () => {
	test.each([
		{ visAarsbelop: false, sum: '18 347' },
		{ visAarsbelop: true, sum: '220 164' },
	])(
		'beholder privat AFP med årsvisning $visAarsbelop',
		({ visAarsbelop, sum }) => {
			render(
				<BeregningSection
					title="Pensjon ved 65 år"
					tableCount={2}
					entry={{ beloep: 10000 }}
					alderspensjonGrad={50}
					visPrivatAfp
					livsvarigAfpBeskrivelse={estimertAfpBeskrivelse}
					privatAfp={{
						...livsvarigEntry,
						kompensasjonstillegg: 0,
						kronetillegg: 0,
						livsvarig: 8347,
					}}
					visAarsbelop={visAarsbelop}
				/>
			)

			expect(screen.getByText('AFP i privat sektor')).toBeVisible()
			expect(
				screen.queryByText('AFP i offentlig sektor')
			).not.toBeInTheDocument()
			expect(
				screen.getByRole('row', { name: /Sum pensjon/ })
			).toHaveTextContent(sum)
		}
	)
})

describe('BeregningSection med livsvarig offentlig AFP', () => {
	test.each([
		{ verdi: true, tekst: 'Ja' },
		{ verdi: false, tekst: 'Nei' },
		{ verdi: null, tekst: undefined },
		{ verdi: undefined, tekst: undefined },
	])(
		'viser AFP påvirket vilkårsprøving ved verdi $verdi',
		({ verdi, tekst }) => {
			vilkaarsproevingsresultat.livsvarigOffentligAfpHarBetydningForInnvilgelse =
				verdi
			render(
				<BeregningSection
					title="Pensjon ved 65 år"
					tableCount={2}
					entry={{ beloep: 10000, inntektspensjonBeloep: 10000 }}
					erFoedtEtter1963
					alderspensjonGrad={100}
					livsvarigOffentligAfp={livsvarigEntry}
					livsvarigAfpBeskrivelse={estimertAfpBeskrivelse}
					visAarsbelop={false}
				/>
			)

			if (tekst) {
				const table = screen
					.getByRole('columnheader', {
						name: 'Opptjening alderspensjon etter kapittel 20',
					})
					.closest('table')!
				expect(
					within(table).getByRole('row', {
						name: `AFP påvirket vilkårsprøving ${tekst}`,
					})
				).toBeVisible()
			} else {
				expect(
					screen.queryByText('AFP påvirket vilkårsprøving')
				).not.toBeInTheDocument()
			}
		}
	)

	test.each([
		{ grad: 50, visAarsbelop: false, sum: '18 347', afp: '8 347' },
		{ grad: 100, visAarsbelop: true, sum: '170 082', afp: '50 082' },
	])(
		'viser ugradert AFP med $grad % AP og årsbeløpet fra API ved årsvisning $visAarsbelop',
		({ grad, visAarsbelop, sum, afp }) => {
			render(
				<BeregningSection
					title="Pensjon ved 65 år"
					tableCount={2}
					entry={{ beloep: 10000, inntektspensjonBeloep: 10000 }}
					erFoedtEtter1963
					alderspensjonGrad={grad}
					livsvarigOffentligAfp={{ ...livsvarigEntry, aarligBeloep: 50082 }}
					livsvarigAfpBeskrivelse={estimertAfpBeskrivelse}
					visAarsbelop={visAarsbelop}
				/>
			)

			expect(screen.getByText(`${grad} % alderspensjon`)).toBeVisible()
			expect(screen.getByText('AFP i offentlig sektor')).toBeVisible()
			expect(screen.getByRole('row', { name: /Sum AFP/ })).toHaveTextContent(
				afp
			)
			expect(
				screen.getByRole('row', { name: /Sum pensjon/ })
			).toHaveTextContent(sum)
			expect(screen.queryByText('AFP i privat sektor')).not.toBeInTheDocument()
		}
	)

	test.each([
		{ grad: 50, visAarsbelop: false },
		{ grad: 100, visAarsbelop: true },
	])(
		'viser AFP-beløp og pensjonssum 0 ved $grad % AP og årsvisning $visAarsbelop',
		({ grad, visAarsbelop }) => {
			render(
				<BeregningSection
					title="Pensjon ved 65 år"
					tableCount={2}
					entry={{ beloep: 0 }}
					alderspensjonGrad={grad}
					livsvarigOffentligAfp={{
						...livsvarigEntry,
						maanedligBeloep: 0,
						aarligBeloep: 0,
					}}
					livsvarigAfpBeskrivelse={estimertAfpBeskrivelse}
					visAarsbelop={visAarsbelop}
				/>
			)

			for (const label of ['Livsvarig AFP', 'Sum AFP', 'Sum pensjon']) {
				const row = screen.getByRole('row', { name: new RegExp(label) })
				expect(within(row).getByRole('cell', { name: /^0$/ })).toBeVisible()
			}
		}
	)

	test('viser AFP uten samlet pensjon når AP-utbetalingen mangler', () => {
		render(
			<BeregningSection
				title="Pensjon ved 65 år"
				tableCount={1}
				alderspensjonGrad={0}
				erUttaksgradNull
				livsvarigOffentligAfp={livsvarigEntry}
				livsvarigAfpBeskrivelse={estimertAfpBeskrivelse}
				visAarsbelop={false}
			/>
		)

		expect(screen.getByRole('row', { name: /Sum AFP/ })).toHaveTextContent(
			'8 347'
		)
		expect(screen.queryByText('Alderspensjon og AFP')).not.toBeInTheDocument()
	})
})

describe('Beskrivelse under livsvarig AFP', () => {
	test.each(['AP-seksjon', 'egen AFP-seksjon'])(
		'viser beskrivelsen fra vedtak i %s',
		(seksjon) => {
			const livsvarigAfpBeskrivelse =
				'AFP-beløpet er hentet fra brukerens vedtak om alderspensjon.'
			const props = {
				title: 'Pensjon ved 65 år',
				tableCount: 1,
				visAarsbelop: false,
				livsvarigAfpBeskrivelse,
			}

			render(
				seksjon === 'AP-seksjon' ? (
					<BeregningSection
						{...props}
						entry={{ beloep: 10000 }}
						alderspensjonGrad={100}
						livsvarigOffentligAfp={livsvarigEntry}
					/>
				) : (
					<AfpBeregningSection
						{...props}
						afp={{ type: 'livsvarig', entry: livsvarigEntry }}
					/>
				)
			)

			expect(screen.getByText(livsvarigAfpBeskrivelse)).toBeVisible()
			expect(screen.queryByText(estimertAfpBeskrivelse)).not.toBeInTheDocument()
		}
	)
})

describe('AfpBeregningSection', () => {
	test.each([false, true])(
		'viser livsvarig AFP med beløp 0 uten AP eller opptjeningsdetaljer med årsvisning %s',
		(visAarsbelop) => {
			render(
				<AfpBeregningSection
					title="AFP ved 65 år"
					tableCount={1}
					afp={{
						type: 'livsvarig',
						entry: { ...livsvarigEntry, maanedligBeloep: 0, aarligBeloep: 0 },
					}}
					livsvarigAfpBeskrivelse={estimertAfpBeskrivelse}
					visAarsbelop={visAarsbelop}
				/>
			)

			for (const label of ['Livsvarig AFP', 'Sum AFP']) {
				const row = screen.getByRole('row', { name: new RegExp(label) })
				expect(within(row).getByRole('cell', { name: /^0$/ })).toBeVisible()
			}
			expect(screen.getByText(estimertAfpBeskrivelse)).toBeVisible()
			expect(screen.queryByText('Alderspensjon og AFP')).not.toBeInTheDocument()
			expect(
				screen.queryByText('Opptjening AFP i offentlig sektor')
			).not.toBeInTheDocument()
		}
	)

	test('beholder tidsbegrenset AFP med detaljer og avkortingsvarsel', () => {
		render(
			<AfpBeregningSection
				title="Pensjon ved 65 år"
				tableCount={2}
				afp={{ type: 'tidsbegrenset', entry: tidsbegrensetEntry }}
				livsvarigAfpBeskrivelse={estimertAfpBeskrivelse}
				visAarsbelop={false}
			/>
		)

		expect(screen.getByText('Grunnpensjon')).toBeVisible()
		expect(screen.getByText('Opptjening AFP i offentlig sektor')).toBeVisible()
		expect(screen.getByText(/Sum redusert pga./)).toBeVisible()
		expect(screen.queryByText('Livsvarig AFP')).not.toBeInTheDocument()
		expect(
			screen.queryByText(/AFP-beløpet er hentet fra/)
		).not.toBeInTheDocument()
	})

	test('varsler forelder når årsvisning endres', () => {
		const onChange = vi.fn()
		render(
			<AfpBeregningSection
				title="Pensjon ved 65 år"
				tableCount={1}
				afp={{ type: 'livsvarig', entry: livsvarigEntry }}
				livsvarigAfpBeskrivelse={estimertAfpBeskrivelse}
				visAarsbelop={false}
				showVisAarsbelopCheckbox
				onVisAarsbelopChange={onChange}
			/>
		)

		fireEvent.click(screen.getByRole('checkbox', { name: 'Vis årsbeløp' }))
		expect(onChange).toHaveBeenCalledWith(true)
	})
})
