import type { Vedtak } from '@pensjonskalkulator-frontend-monorepo/types'
import { describe, expect, test } from 'vitest'

import {
	mockOpptjeningKap19,
	mockOpptjeningKap20,
} from '../components/Beregning/__mocks__/opptjening'
import {
	type BeregningResult,
	defaultBeregningFormData,
} from './beregningTypes'
import { mapUtenlandsperiodeListe } from './mapBeregningParams'
import {
	mapBeregningResultToLagreSpec,
	mapPensjonsopptjeningToLagreDto,
} from './mapLagreSimulering'

describe('lagring av livsvarig offentlig AFP', () => {
	const estimertBeskrivelse =
		'AFP-beløpet er estimert av Nav og er ikke en bekreftelse av rett til AFP. I beregningen av alderspensjon er livsvarig AFP tatt med fordi den kan ha betydning for når og hvordan alderspensjonen tas ut. Det er tjenestepensjonsordningen din som beregner og vurderer retten til AFP.'
	const hentetBeskrivelse =
		'AFP-beløpet er hentet fra <Statens pensjonskasse>. I beregningen av alderspensjon er livsvarig AFP tatt med fordi den kan ha betydning for når og hvordan alderspensjonen tas ut. Nav er ikke ansvarlig for beløpene som er hentet fra andre.'
	const beggeVedtakBeskrivelse =
		'I beregningen av alderspensjon er livsvarig AFP tatt med fordi den kan ha betydning for når og hvordan alderspensjonen tas ut. AFP-beløpet ble hentet fra tjenestepensjonsordningen din ved saksbehandling av alderspensjonen din.'
	const apVedtak: Vedtak = {
		harVedtak: true,
		loependeAlderspensjon: {
			grad: 100,
			fom: '2025-05-01',
			uttaksgradFom: '2025-05-01',
			sivilstatus: 'GIFT',
			harGjenlevenderett: false,
			harUtenlandsopphold: false,
		},
	}
	const fremtidigApVedtak: Vedtak = {
		harVedtak: true,
		fremtidigAlderspensjon: { grad: 100, fom: '2031-05-01' },
	}
	const foersteUtbetaling = {
		alderAar: 62,
		maanedligBeloep: 8347,
		aarligBeloep: 50082,
	}
	const result: BeregningResult = {
		alderspensjonListe: [],
		opptjeningListe: [],
		vilkaarsproevingsresultat: { erInnvilget: true },
	}

	test.each([
		{ uttaksgrad: 0, utbetaling: foersteUtbetaling },
		{ uttaksgrad: 50, utbetaling: foersteUtbetaling },
		{ uttaksgrad: 100, utbetaling: foersteUtbetaling },
		{
			uttaksgrad: 50,
			utbetaling: {
				...foersteUtbetaling,
				maanedligBeloep: 0,
				aarligBeloep: 0,
			},
		},
		{
			uttaksgrad: 50,
			utbetaling: { ...foersteUtbetaling, maanedligBeloep: null },
		},
		{
			uttaksgrad: 100,
			utbetaling: { ...foersteUtbetaling, maanedligBeloep: undefined },
		},
	])(
		'lagrer første AFP-utbetaling ved $uttaksgrad % uttak og månedsbeløp $utbetaling.maanedligBeloep',
		({ uttaksgrad, utbetaling }) => {
			const spec = mapBeregningResultToLagreSpec(
				{
					...result,
					livsvarigOffentligAfpListe: [
						utbetaling,
						{ alderAar: 67, maanedligBeloep: 8500, aarligBeloep: 102000 },
					],
				},
				'1964-04-30',
				{
					...defaultBeregningFormData,
					afp: 'ja_offentlig',
					uttaksgrad,
					alderAarUttak: 65,
					alderMdUttak: 0,
					alderAarHeltUttak: 67,
					alderMdHeltUttak: 0,
				}
			)

			const forventetUtbetaling = {
				...utbetaling,
				maanedligBeloep: utbetaling.maanedligBeloep ?? 0,
			}
			expect(spec.afpOffentligLivsvarig).toEqual({
				beskrivelse: estimertBeskrivelse,
				vedGradertUttak: uttaksgrad === 100 ? null : forventetUtbetaling,
				vedHeltUttak: forventetUtbetaling,
			})
		}
	)

	test.each([
		{
			navn: 'ingen vedtak',
			vedtak: undefined,
			afpStatus: false,
			beskrivelse: estimertBeskrivelse,
			kunBeskrivelse: false,
		},
		{
			navn: 'kun AP-vedtak',
			vedtak: apVedtak,
			afpStatus: false,
			beskrivelse: estimertBeskrivelse,
			kunBeskrivelse: false,
		},
		{
			navn: 'kun fremtidig AP-vedtak',
			vedtak: fremtidigApVedtak,
			afpStatus: false,
			beskrivelse: estimertBeskrivelse,
			kunBeskrivelse: false,
		},
		{
			navn: 'kun AFP-vedtak',
			vedtak: undefined,
			afpStatus: true,
			beskrivelse: hentetBeskrivelse,
			kunBeskrivelse: false,
		},
		{
			navn: 'AP- og AFP-vedtak',
			vedtak: apVedtak,
			afpStatus: true,
			beskrivelse: beggeVedtakBeskrivelse,
			kunBeskrivelse: true,
		},
		{
			navn: 'fremtidig AP- og AFP-vedtak',
			vedtak: fremtidigApVedtak,
			afpStatus: true,
			beskrivelse: beggeVedtakBeskrivelse,
			kunBeskrivelse: true,
		},
	])(
		'lagrer riktig brevtekst og tabellgrunnlag ved $navn',
		({ vedtak, afpStatus, beskrivelse, kunBeskrivelse }) => {
			const spec = mapBeregningResultToLagreSpec(
				{
					...result,
					livsvarigOffentligAfpListe: [
						foersteUtbetaling,
						{ alderAar: 67, maanedligBeloep: 8500, aarligBeloep: 102000 },
					],
				},
				'1964-04-30',
				{
					...defaultBeregningFormData,
					afp: 'ja_offentlig',
					uttaksgrad: 50,
					alderAarUttak: 65,
					alderMdUttak: 0,
					alderAarHeltUttak: 67,
					alderMdHeltUttak: 0,
				},
				undefined,
				undefined,
				undefined,
				vedtak,
				undefined,
				undefined,
				{ afpStatus }
			)

			expect(spec.afpOffentligLivsvarig).toEqual({
				beskrivelse,
				vedGradertUttak: kunBeskrivelse ? null : foersteUtbetaling,
				vedHeltUttak: kunBeskrivelse ? null : foersteUtbetaling,
			})
		}
	)

	test.each([null, undefined, []])(
		'lagrer kun avsnitt ved begge vedtak selv om AFP-listen er %s',
		(livsvarigOffentligAfpListe) => {
			const spec = mapBeregningResultToLagreSpec(
				{ ...result, livsvarigOffentligAfpListe },
				'1964-04-30',
				defaultBeregningFormData,
				undefined,
				undefined,
				undefined,
				apVedtak,
				undefined,
				undefined,
				{ afpStatus: true }
			)

			expect(spec.afpOffentligLivsvarig).toEqual({
				beskrivelse: beggeVedtakBeskrivelse,
				vedGradertUttak: null,
				vedHeltUttak: null,
			})
		}
	)

	test.each([null, undefined, []])(
		'utelater livsvarig AFP når listen er %s',
		(livsvarigOffentligAfpListe) => {
			const spec = mapBeregningResultToLagreSpec(
				{ ...result, livsvarigOffentligAfpListe },
				'1964-04-30'
			)

			expect(spec.afpOffentligLivsvarig).toBeNull()
		}
	)
})

describe('mapPensjonsopptjeningToLagreDto', () => {
	test('maps the same sorted rows shown in the accrual table', () => {
		expect(mapPensjonsopptjeningToLagreDto(mockOpptjeningKap20, true)).toEqual([
			{
				aarstall: 2024,
				pensjonsgivendeInntekt: 0,
				pensjonspoeng: 0,
				pensjonsbeholdning: 0,
				merknad: '',
			},
			{
				aarstall: 2023,
				pensjonsgivendeInntekt: 0,
				pensjonspoeng: 0,
				pensjonsbeholdning: 0,
				merknad: '',
			},
			{
				aarstall: 2022,
				pensjonsgivendeInntekt: 193192,
				pensjonspoeng: 3.47,
				pensjonsbeholdning: 0,
				merknad: 'Mottak av dagpenger',
			},
			{
				aarstall: 2021,
				pensjonsgivendeInntekt: 278034,
				pensjonspoeng: 3.47,
				pensjonsbeholdning: 501831,
				merknad:
					'Du er godskrevet omsorgsopptjening for ulønnet omsorgsarbeid i dette året',
			},
			{
				aarstall: 2020,
				pensjonsgivendeInntekt: 639932,
				pensjonspoeng: 3.47,
				pensjonsbeholdning: 498943,
				merknad: '',
			},
			{
				aarstall: 2019,
				pensjonsgivendeInntekt: 278034,
				pensjonspoeng: 3.47,
				pensjonsbeholdning: 501831,
				merknad:
					'Pensjonsbeholdningen din ble etablert med virkning 1. januar 2010 i forbindelse med at pensjonsreformen trådte i kraft. Da ble den opptjeningen du hadde i kalenderår frem til og med 2008 (siste år med ferdig skattemelding) summert til en beholdningsstørrelse., Mottak av dagpenger',
			},
		])
	})

	test('omits pension balance for cohorts where the table does not show it', () => {
		const rows = mapPensjonsopptjeningToLagreDto(mockOpptjeningKap19, false)

		expect(rows).toHaveLength(3)
		expect(rows[0]).toMatchObject({
			aarstall: 2022,
			pensjonsgivendeInntekt: 450000,
			pensjonspoeng: 4.12,
			pensjonsbeholdning: null,
		})
	})
})

describe('mapUtenlandsperiodeListe', () => {
	test('preserves the input order when mapping foreign stays', () => {
		const periods = mapUtenlandsperiodeListe([
			{
				landkode: 'DZA',
				arbeidetUtenlands: false,
				fom: '01.01.2020',
				tom: '31.12.2020',
				brukFoedselsdato: false,
			},
			{
				landkode: 'BEL',
				arbeidetUtenlands: false,
				fom: '01.01.2024',
				tom: '31.12.2024',
				brukFoedselsdato: false,
			},
		])

		expect(periods.map(({ fom }) => fom)).toEqual(['2020-01-01', '2024-01-01'])
	})
})
