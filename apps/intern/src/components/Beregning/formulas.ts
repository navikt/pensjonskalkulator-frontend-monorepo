import type { Formula } from './FormulaPopover'

const formulas: Record<string, Formula> = {
	'formler.grunnpensjon_4': {
		title: 'Grunnpensjon',
		numerator: ['G × Trygdetid × Uttaksgrad × Andel dagens regler'],
		denominator: '40 × Forholdstall',
	},
	'formler.grunnpensjon_3': {
		title: 'Grunnpensjon',
		numerator: ['G × Trygdetid × Uttaksgrad'],
		denominator: '40 × Forholdstall',
	},
	'formler.grunnpensjon_2': {
		title: 'Grunnpensjon',
		numerator: ['G × Trygdetid'],
		denominator: '40',
	},
	'formler.grunnpensjon_1': {
		title: 'Grunnpensjon',
		numerator: ['1G × Trygdetid × Uttaksgrad'],
		denominator: '40 × Forholdstall',
	},
	'formler.grunnpensjon_redusert_4': {
		title: 'Grunnpensjon',
		numerator: ['90% × G × Trygdetid × Uttaksgrad × Andel dagens regler'],
		denominator: '40 × Forholdstall',
	},
	'formler.grunnpensjon_redusert_3': {
		title: 'Grunnpensjon',
		numerator: ['90% × G × Trygdetid × Uttaksgrad'],
		denominator: '40 × Forholdstall',
	},
	'formler.grunnpensjon_redusert_2': {
		title: 'Grunnpensjon',
		numerator: ['90% × G × Trygdetid'],
		denominator: '40',
	},
	'formler.grunnpensjon_redusert_1': {
		title: 'Grunnpensjon',
		numerator: ['90% × 1G × Trygdetid × Uttaksgrad'],
		denominator: '40 × Forholdstall',
	},
	'formler.tilleggspensjon_4': {
		title: 'Tilleggspensjon',
		numerator: [
			'G × Sluttpoengtall',
			'× (45% × Antall poengår før 92 + 42% × Antall poengår etter 91)',
			'× Uttaksgrad × Andel dagens regler',
		],
		denominator: '40 × Forholdstall',
	},
	'formler.tilleggspensjon_3': {
		title: 'Tilleggspensjon',
		numerator: [
			'G × Sluttpoengtall',
			'× (45% × Antall poengår før 92 + 42% × Antall poengår etter 91)',
			'× Uttaksgrad',
		],
		denominator: '40 × Forholdstall',
	},
	'formler.tilleggspensjon_2': {
		title: 'Tilleggspensjon',
		numerator: [
			'G × Sluttpoengtall',
			'× (45% × Antall poengår før 92 + 42% × Antall poengår etter 91)',
		],
		denominator: '40',
	},
	'formler.tilleggspensjon_1': {
		title: 'Tilleggspensjon',
		numerator: [
			'1G × Sluttpoengtall',
			'× (45% × Antall poengår før 92 + 42% × Antall poengår etter 91)',
			'× Uttaksgrad',
		],
		denominator: '40 × Forholdstall',
	},
	'formler.pensjonstillegg_4': {
		title: 'Pensjonstillegg',
		numerator: [
			'(Minstepensjonsnivå × Forholdstall ved 67 år - Basispensjon)',
			'× Uttaksgrad × Andel dagens regler',
		],
		denominator: 'Forholdstall',
	},
	'formler.pensjonstillegg_3': {
		title: 'Pensjonstillegg',
		numerator: [
			'(Minstepensjonsnivå × Forholdstall ved 67 år - Basispensjon)',
			'× Uttaksgrad',
		],
		denominator: 'Forholdstall',
	},
	'formler.pensjonstillegg_1': {
		title: 'Pensjonstillegg',
		numerator: ['Minstepensjonsnivå × Forholdstall ved 67 år - Basispensjon'],
		denominator: 'Forholdstall',
	},
	'formler.inntektspensjon_3': {
		title: 'Inntektspensjon',
		numerator: ['Pensjonsbeholdning × Uttaksgrad × Andel nye regler'],
		denominator: 'Delingstall',
	},
	'formler.inntektspensjon_2': {
		title: 'Inntektspensjon',
		numerator: ['Pensjonsbeholdning × Uttaksgrad'],
		denominator: 'Delingstall',
	},
	'formler.inntektspensjon_1': {
		title: 'Inntektspensjon',
		numerator: ['Pensjonsbeholdning'],
		denominator: 'Delingstall',
	},
	'formler.garantipensjon': {
		title: 'Garantipensjon',
		numerator: ['Garantipensjonsbeholdning'],
		denominator: 'Delingstall',
	},
	sluttpoengtall: {
		title: 'Sluttpoengtall',
		numerator: ['Gjennomsnittet av de 20 beste poengårene'],
		denominator: '',
	},
	pensjonsbeholdning: {
		title: 'Pensjonsbeholdning',
		numerator: [
			'Summen av 18,1% × Pensjonsgivende inntekt opptil 7,1G',
			'for alle yrkesaktive år',
		],
		denominator: '',
	},
	ip2: {
		title: 'Inntektspensjon',
		numerator: [
			'Inntektspensjon før endring × Delingstall ved endring',
			'+ Pensjonsbeholdning før endring',
		],
		denominator: 'Delingstall',
	},
	gp3: {
		title: 'Grunnpensjon',
		numerator: [
			'(Grunnpensjon før endring × Forholdstall ved uttak)',
			'+ Restgrunnpensjon før endring',
		],
		denominator: 'Forholdstall',
	},
	tp3: {
		title: 'Tilleggspensjon',
		numerator: [
			'Resttilleggspensjon før endring',
			'+ (Tilleggspensjon før endring × Forholdstall ved uttak)',
		],
		denominator: 'Forholdstall',
	},
	gap2: {
		title: 'Garantipensjon',
		numerator: [
			'Garantipensjon før endring × Delingstall ved endring',
			'+ Garantipensjonsbeholdning før endring',
		],
		denominator: 'Delingstall',
	},
	'afp_privat.livsvd1': {
		title: 'AFP livsvarig del',
		numerator: ['Opptjeningsgrunnlag × Opptjeningsprosent'],
		denominator: 'Forholdstall ved uttak',
	},
	'afp_privat.livsvd2': {
		title: 'AFP livsvarig del',
		numerator: [
			'Opptjeningsgrunnlag × Opptjeningsprosent',
			'- Justeringsbeløp',
		],
		denominator: 'Forholdstall ved uttak',
	},
	'afp_privat.kompt1': {
		title: 'Kompensasjonstillegg',
		numerator: ['Referansebeløp'],
		denominator: 'Forholdstall kompensasjonstillegg ved uttak',
	},
	basis_grunnpensjon: {
		title: 'Basisgrunnpensjon',
		numerator: ['G × Trygdetid'],
		denominator: '40',
	},
	basis_tilleggspensjon: {
		title: 'Basistilleggspensjon',
		numerator: [
			'G × Sluttpoengtall',
			'× (45% × Antall poengår før 1992 + 42% × Antall poengår etter 1991)',
		],
		denominator: '40',
	},
	skjerm1: {
		title: 'Skjermingstillegg',
		numerator: [
			'Skjermingsgrad × Uførepensjon måneden før pensjonering',
			'× (Forholdstall ved 67 - 1)',
		],
		denominator: 'Forholdstall ved 67',
	},
	skjerm2: {
		title: 'Skjermingstillegg',
		numerator: [
			'Skjermingsgrad × (Forholdstall ved 67 - 1)',
			'× Gjenlevendepensjon måneden før pensjonering',
		],
		denominator: 'Forholdstall ved 67',
	},
	saertillegg_redusert: {
		title: 'Særtillegg',
		numerator: ['74% × Grunnbeløpet'],
		denominator: '',
	},
	saertillegg_ordinaer: {
		title: 'Særtillegg',
		numerator: ['94% × Grunnbeløpet'],
		denominator: '',
	},
}

export function getFormula(key: string): Formula | undefined {
	const formula = formulas[key]
	if (!formula) return undefined
	return { ...formula, key }
}
