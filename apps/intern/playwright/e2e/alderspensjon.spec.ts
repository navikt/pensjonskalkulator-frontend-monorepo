import { expect, test } from '@playwright/test'
import { mockApi } from 'utils/mock'

const PERSON_API_URL = '**/api/intern/v1/person'
const DECRYPT_API_URL = '**/api/v1/decrypt'
const LOEPENDE_VEDTAK_API_URL = '**/api/v4/vedtak/loepende-vedtak'
const GRUNNBELOEP_API_URL = '**/api/v1/grunnbel*'
const SIMULERING_API_URL = '**/api/v9/alderspensjon/simulering'

const PERSON_MOCK_FILE = 'person.json'
const LOEPENDE_VEDTAK_MOCK_FILE = 'loepende-vedtak.json'
const ALDERSPENSJON_MOCK_FILE = 'alderspensjon.json'

async function setupDefaultMocks(
	page: import('@playwright/test').Page,
	personOverrides?: Record<string, unknown>
) {
	await mockApi(page, DECRYPT_API_URL, undefined, undefined)
	await page.route(DECRYPT_API_URL, (route) =>
		route.fulfill({
			status: 200,
			contentType: 'text/plain',
			body: '04925398980',
		})
	)
	await mockApi(page, PERSON_API_URL, PERSON_MOCK_FILE, personOverrides)
	await mockApi(page, LOEPENDE_VEDTAK_API_URL, LOEPENDE_VEDTAK_MOCK_FILE)
	await mockApi(page, GRUNNBELOEP_API_URL, undefined, {
		dato: '2024-05-01',
		grunnbeløp: 100000,
		grunnbeløpPerMaaned: 10000,
		gjennomsnittPerÅr: 99000,
		omregningsfaktor: 1.05,
		virkningstidspunktForMinsteinntekt: '2024-09-01',
	})
}

async function navigateToApp(page: import('@playwright/test').Page) {
	await page.goto('/?pid=encrypted-default-pid')
	await page.waitForSelector('text=Pensjonskalkulator')
}

test.describe('Alderspensjon - BeregningForm', () => {
	test.describe('Skjema vises med riktige felter', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)
		})

		test('Viser sivilstand forhåndsutfylt fra persondata', async ({ page }) => {
			const sivilstandSelect = page.getByRole('combobox', {
				name: 'Hva er sivilstanden til bruker ved uttak av pensjon?',
			})
			await expect(sivilstandSelect).toBeVisible()
			await expect(sivilstandSelect).toHaveValue('UGIFT')
		})

		test('Viser inntektsfelt', async ({ page }) => {
			await expect(
				page.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt frem til uttak',
				})
			).toBeVisible()
		})

		test('Viser alder-velger for uttak', async ({ page }) => {
			await expect(
				page.getByRole('combobox', { name: 'Alder (år) for uttak' })
			).toBeVisible()
			await expect(
				page.getByRole('combobox', { name: 'Alder (md.) for uttak' })
			).toBeVisible()
		})

		test('Viser uttaksgrad', async ({ page }) => {
			await expect(
				page.getByRole('combobox', { name: 'Uttaksgrad' })
			).toBeVisible()
		})

		test('Viser spørsmål om inntekt ved siden av 100 % uttak', async ({
			page,
		}) => {
			await expect(
				page.getByRole('group', {
					name: 'Har bruker inntekt ved siden av 100 % uttak?',
				})
			).toBeVisible()
		})

		test('Viser Beregn pensjon-knapp', async ({ page }) => {
			await expect(
				page.getByRole('button', { name: 'Beregn pensjon' })
			).toBeVisible()
		})

		test('Viser Nullstill-knapp', async ({ page }) => {
			await expect(
				page.getByRole('button', { name: 'Nullstill' })
			).toBeVisible()
		})
	})

	test.describe('Sivilstand - Betinget visning av EPS-felter', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)
		})

		test('Viser ikke EPS-felter for sivilstand Ugift', async ({ page }) => {
			const sivilstandSelect = page.getByRole('combobox', {
				name: 'Hva er sivilstanden til bruker ved uttak av pensjon?',
			})
			await sivilstandSelect.selectOption('UGIFT')

			await expect(
				page.getByRole('group', {
					name: /Vil brukers .* motta pensjon, uføretrygd eller AFP\?/,
				})
			).not.toBeVisible()
		})

		for (const sivilstand of ['GIFT', 'SAMBOER', 'REGISTRERT_PARTNER']) {
			test(`Viser EPS pensjon-spørsmål for sivilstand: ${sivilstand}`, async ({
				page,
			}) => {
				const sivilstandSelect = page.getByRole('combobox', {
					name: 'Hva er sivilstanden til bruker ved uttak av pensjon?',
				})
				await sivilstandSelect.selectOption(sivilstand)

				await expect(
					page.getByRole('group', {
						name: /Vil brukers .* motta pensjon, uføretrygd eller AFP\?/,
					})
				).toBeVisible()
			})
		}

		test('Viser EPS inntekt over 2G-spørsmål når epsHarPensjon er Nei', async ({
			page,
		}) => {
			const sivilstandSelect = page.getByRole('combobox', {
				name: 'Hva er sivilstanden til bruker ved uttak av pensjon?',
			})
			await sivilstandSelect.selectOption('GIFT')

			const epsHarPensjonGroup = page.getByRole('group', {
				name: /Vil brukers ektefelle motta pensjon, uføretrygd eller AFP\?/,
			})
			await expect(epsHarPensjonGroup).toBeVisible()

			await epsHarPensjonGroup.getByLabel('Nei').check()

			await expect(
				page.getByRole('group', {
					name: /Vil brukers ektefelle ha inntekt over 2G/,
				})
			).toBeVisible()
		})

		test('Viser ikke EPS inntekt over 2G-spørsmål når epsHarPensjon er Ja', async ({
			page,
		}) => {
			const sivilstandSelect = page.getByRole('combobox', {
				name: 'Hva er sivilstanden til bruker ved uttak av pensjon?',
			})
			await sivilstandSelect.selectOption('GIFT')

			const epsHarPensjonGroup = page.getByRole('group', {
				name: /Vil brukers ektefelle motta pensjon, uføretrygd eller AFP\?/,
			})
			await epsHarPensjonGroup.getByLabel('Ja').check()

			await expect(
				page.getByRole('group', {
					name: /Vil brukers ektefelle ha inntekt over 2G/,
				})
			).not.toBeVisible()
		})

		test('Nullstiller EPS-felter når sivilstand endres tilbake til Ugift', async ({
			page,
		}) => {
			const sivilstandSelect = page.getByRole('combobox', {
				name: 'Hva er sivilstanden til bruker ved uttak av pensjon?',
			})
			await sivilstandSelect.selectOption('GIFT')

			const epsHarPensjonGroup = page.getByRole('group', {
				name: /Vil brukers ektefelle motta pensjon, uføretrygd eller AFP\?/,
			})
			await epsHarPensjonGroup.getByLabel('Nei').check()

			await expect(
				page.getByRole('group', {
					name: /Vil brukers ektefelle ha inntekt over 2G/,
				})
			).toBeVisible()

			await sivilstandSelect.selectOption('UGIFT')

			await expect(epsHarPensjonGroup).not.toBeVisible()
			await expect(
				page.getByRole('group', {
					name: /Vil brukers .* ha inntekt over 2G/,
				})
			).not.toBeVisible()
		})
	})

	test.describe('Uttaksgrad - Betinget visning av gradert uttak-felter', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)
		})

		test('Viser ikke gradert uttak-felter for 100 % uttaksgrad', async ({
			page,
		}) => {
			await page
				.getByRole('combobox', { name: 'Uttaksgrad' })
				.selectOption('100')

			await expect(
				page.getByRole('combobox', { name: 'Alder (år) for 100 % uttak' })
			).not.toBeVisible()
			await expect(
				page.getByRole('combobox', { name: 'Alder (md.) for 100 % uttak' })
			).not.toBeVisible()
		})

		for (const grad of [20, 40, 50, 60, 80]) {
			test(`Viser gradert uttak-felter for ${grad} % uttaksgrad`, async ({
				page,
			}) => {
				await page
					.getByRole('combobox', { name: 'Uttaksgrad' })
					.selectOption(String(grad))

				await expect(
					page.getByRole('group', {
						name: `Har bruker inntekt ved siden av ${grad} % uttak?`,
					})
				).toBeVisible()

				await expect(
					page.getByRole('combobox', {
						name: 'Alder (år) for 100 % uttak',
					})
				).toBeVisible()

				await expect(
					page.getByRole('combobox', {
						name: 'Alder (md.) for 100 % uttak',
					})
				).toBeVisible()
			})
		}

		test('Viser inntektsfelt for gradert uttak når bruker har inntekt', async ({
			page,
		}) => {
			await page
				.getByRole('combobox', { name: 'Uttaksgrad' })
				.selectOption('60')

			const gradertInntektGroup = page.getByRole('group', {
				name: 'Har bruker inntekt ved siden av 60 % uttak?',
			})
			await gradertInntektGroup.getByLabel('Ja').check()

			await expect(
				page.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt ved siden av 60 % uttak',
				})
			).toBeVisible()
		})

		test('Viser ikke inntektsfelt for gradert uttak når bruker ikke har inntekt', async ({
			page,
		}) => {
			await page
				.getByRole('combobox', { name: 'Uttaksgrad' })
				.selectOption('60')

			const gradertInntektGroup = page.getByRole('group', {
				name: 'Har bruker inntekt ved siden av 60 % uttak?',
			})
			await gradertInntektGroup.getByLabel('Nei').check()

			await expect(
				page.getByRole('textbox', {
					name: /Pensjonsgivende inntekt ved siden av 60 % uttak/,
				})
			).not.toBeVisible()
		})

		test('Nullstiller gradert uttak-felter når uttaksgrad endres til 100 %', async ({
			page,
		}) => {
			await page
				.getByRole('combobox', { name: 'Uttaksgrad' })
				.selectOption('60')

			const gradertInntektGroup = page.getByRole('group', {
				name: 'Har bruker inntekt ved siden av 60 % uttak?',
			})
			await gradertInntektGroup.getByLabel('Ja').check()

			await expect(
				page.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt ved siden av 60 % uttak',
				})
			).toBeVisible()

			await page
				.getByRole('combobox', { name: 'Uttaksgrad' })
				.selectOption('100')

			await expect(
				page.getByRole('group', {
					name: 'Har bruker inntekt ved siden av 60 % uttak?',
				})
			).not.toBeVisible()
			await expect(
				page.getByRole('combobox', { name: 'Alder (år) for 100 % uttak' })
			).not.toBeVisible()
		})
	})

	test.describe('Inntekt ved siden av 100 % uttak - Betinget visning', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)
		})

		test('Viser inntektsfelt og alder-velger når bruker har inntekt', async ({
			page,
		}) => {
			const inntektGroup = page.getByRole('group', {
				name: 'Har bruker inntekt ved siden av 100 % uttak?',
			})
			await inntektGroup.getByLabel('Ja').check()

			await expect(
				page.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt ved siden av 100 % uttak',
				})
			).toBeVisible()
			await expect(
				page.getByRole('combobox', { name: 'Alder (år) inntekt slutter' })
			).toBeVisible()
			await expect(
				page.getByRole('combobox', { name: 'Alder (md.) inntekt slutter' })
			).toBeVisible()
		})

		test('Viser ikke inntektsfelt når bruker ikke har inntekt', async ({
			page,
		}) => {
			const inntektGroup = page.getByRole('group', {
				name: 'Har bruker inntekt ved siden av 100 % uttak?',
			})
			await inntektGroup.getByLabel('Nei').check()

			await expect(
				page.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt ved siden av 100 % uttak',
				})
			).not.toBeVisible()
			await expect(
				page.getByRole('combobox', { name: 'Alder (år) inntekt slutter' })
			).not.toBeVisible()
		})

		test('Nullstiller inntektsfelt når bruker endrer fra Ja til Nei', async ({
			page,
		}) => {
			const inntektGroup = page.getByRole('group', {
				name: 'Har bruker inntekt ved siden av 100 % uttak?',
			})
			await inntektGroup.getByLabel('Ja').check()

			await page
				.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt ved siden av 100 % uttak',
				})
				.fill('500000')

			await inntektGroup.getByLabel('Nei').check()

			await expect(
				page.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt ved siden av 100 % uttak',
				})
			).not.toBeVisible()
		})
	})

	test.describe('Validering', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)
		})

		test('Viser feilmeldinger ved tom innsending', async ({ page }) => {
			const sivilstandSelect = page.getByRole('combobox', {
				name: 'Hva er sivilstanden til bruker ved uttak av pensjon?',
			})
			await sivilstandSelect.selectOption('')

			await page.getByRole('button', { name: 'Beregn pensjon' }).click()

			await expect(page.getByText('Sivilstand er påkrevd')).toBeVisible()
			await expect(
				page.getByText('Pensjonsgivende inntekt frem til uttak er påkrevd')
			).toBeVisible()
			await expect(
				page.getByText('Alder (år) for uttak er påkrevd')
			).toBeVisible()
			await expect(page.getByText('Uttaksgrad er påkrevd')).toBeVisible()
			await expect(
				page.getByText(
					'Du må velge om bruker har inntekt ved siden av 100 % uttak'
				)
			).toBeVisible()
		})

		test('Viser feilmelding for EPS-felt når partnersivilstand er valgt', async ({
			page,
		}) => {
			const sivilstandSelect = page.getByRole('combobox', {
				name: 'Hva er sivilstanden til bruker ved uttak av pensjon?',
			})
			await sivilstandSelect.selectOption('GIFT')

			await page.getByRole('button', { name: 'Beregn pensjon' }).click()

			await expect(
				page.getByText(
					'Du må velge om ektefelle/partner/samboer mottar pensjon'
				)
			).toBeVisible()
		})

		test('Viser feilmelding for gradert uttak-felter', async ({ page }) => {
			const sivilstandSelect = page.getByRole('combobox', {
				name: 'Hva er sivilstanden til bruker ved uttak av pensjon?',
			})
			await sivilstandSelect.selectOption('UGIFT')

			await page
				.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt frem til uttak',
				})
				.fill('500000')

			await page
				.getByRole('combobox', { name: 'Alder (år) for uttak' })
				.selectOption('67')

			await page
				.getByRole('combobox', { name: 'Uttaksgrad' })
				.selectOption('60')

			await page
				.getByRole('group', {
					name: 'Har bruker inntekt ved siden av 100 % uttak?',
				})
				.getByLabel('Nei')
				.check()

			await page.getByRole('button', { name: 'Beregn pensjon' }).click()

			await expect(
				page.getByText('Alder (år) for 100 % uttak er påkrevd')
			).toBeVisible()
		})

		test('Viser feilmelding når helt uttak alder er før gradert uttak alder', async ({
			page,
		}) => {
			const sivilstandSelect = page.getByRole('combobox', {
				name: 'Hva er sivilstanden til bruker ved uttak av pensjon?',
			})
			await sivilstandSelect.selectOption('UGIFT')

			await page
				.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt frem til uttak',
				})
				.fill('500000')

			await page
				.getByRole('combobox', { name: 'Alder (år) for uttak' })
				.selectOption('67')

			await page
				.getByRole('combobox', { name: 'Uttaksgrad' })
				.selectOption('60')

			await page
				.getByRole('combobox', { name: 'Alder (år) for 100 % uttak' })
				.selectOption('65')

			await page
				.getByRole('group', {
					name: 'Har bruker inntekt ved siden av 100 % uttak?',
				})
				.getByLabel('Nei')
				.check()

			await page.getByRole('button', { name: 'Beregn pensjon' }).click()

			await expect(
				page.getByText(
					'Alder for 100 % uttak kan ikke være før alder for uttak'
				)
			).toBeVisible()
		})

		test('Viser feilmelding for inntekt ved siden av uttak-felter', async ({
			page,
		}) => {
			const sivilstandSelect = page.getByRole('combobox', {
				name: 'Hva er sivilstanden til bruker ved uttak av pensjon?',
			})
			await sivilstandSelect.selectOption('UGIFT')

			await page
				.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt frem til uttak',
				})
				.fill('500000')

			await page
				.getByRole('combobox', { name: 'Alder (år) for uttak' })
				.selectOption('67')

			await page
				.getByRole('combobox', { name: 'Uttaksgrad' })
				.selectOption('100')

			await page
				.getByRole('group', {
					name: 'Har bruker inntekt ved siden av 100 % uttak?',
				})
				.getByLabel('Ja')
				.check()

			await page.getByRole('button', { name: 'Beregn pensjon' }).click()

			await expect(
				page.getByText('Pensjonsgivende inntekt ved siden av uttak er påkrevd')
			).toBeVisible()
			await expect(
				page.getByText('Alder (år) inntekt slutter er påkrevd')
			).toBeVisible()
		})
	})

	test.describe('Innsending - 100 % uttak', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await mockApi(page, SIMULERING_API_URL, ALDERSPENSJON_MOCK_FILE)
			await navigateToApp(page)
		})

		test('Sender inn skjema med 100 % uttak uten inntekt', async ({ page }) => {
			await page
				.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt frem til uttak',
				})
				.fill('500000')
			await page
				.getByRole('combobox', { name: 'Alder (år) for uttak' })
				.selectOption('67')
			await page
				.getByRole('combobox', { name: 'Uttaksgrad' })
				.selectOption('100')
			await page
				.getByRole('group', {
					name: 'Har bruker inntekt ved siden av 100 % uttak?',
				})
				.getByLabel('Nei')
				.check()

			await page.getByRole('button', { name: 'Beregn pensjon' }).click()

			await expect(page.getByText('Sivilstand er påkrevd')).not.toBeVisible()
		})

		test('Sender inn skjema med 100 % uttak med inntekt', async ({ page }) => {
			await page
				.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt frem til uttak',
				})
				.fill('500000')
			await page
				.getByRole('combobox', { name: 'Alder (år) for uttak' })
				.selectOption('67')
			await page
				.getByRole('combobox', { name: 'Uttaksgrad' })
				.selectOption('100')
			await page
				.getByRole('group', {
					name: 'Har bruker inntekt ved siden av 100 % uttak?',
				})
				.getByLabel('Ja')
				.check()
			await page
				.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt ved siden av 100 % uttak',
				})
				.fill('200000')
			await page
				.getByRole('combobox', { name: 'Alder (år) inntekt slutter' })
				.selectOption('70')

			await page.getByRole('button', { name: 'Beregn pensjon' }).click()

			await expect(page.getByText('Sivilstand er påkrevd')).not.toBeVisible()
		})
	})

	test.describe('Innsending - Gradert uttak', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await mockApi(page, SIMULERING_API_URL, ALDERSPENSJON_MOCK_FILE)
			await navigateToApp(page)
		})

		test('Sender inn skjema med gradert uttak uten inntekt', async ({
			page,
		}) => {
			await page
				.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt frem til uttak',
				})
				.fill('500000')
			await page
				.getByRole('combobox', { name: 'Alder (år) for uttak' })
				.selectOption('62')
			await page
				.getByRole('combobox', { name: 'Uttaksgrad' })
				.selectOption('60')
			await page
				.getByRole('group', {
					name: 'Har bruker inntekt ved siden av 60 % uttak?',
				})
				.getByLabel('Nei')
				.check()
			await page
				.getByRole('combobox', { name: 'Alder (år) for 100 % uttak' })
				.selectOption('67')
			await page
				.getByRole('group', {
					name: 'Har bruker inntekt ved siden av 100 % uttak?',
				})
				.getByLabel('Nei')
				.check()

			await page.getByRole('button', { name: 'Beregn pensjon' }).click()

			await expect(page.getByText('Sivilstand er påkrevd')).not.toBeVisible()
			await expect(page.getByText('Uttaksgrad er påkrevd')).not.toBeVisible()
		})

		test('Sender inn skjema med gradert uttak med inntekt', async ({
			page,
		}) => {
			await page
				.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt frem til uttak',
				})
				.fill('500000')
			await page
				.getByRole('combobox', { name: 'Alder (år) for uttak' })
				.selectOption('62')
			await page
				.getByRole('combobox', { name: 'Uttaksgrad' })
				.selectOption('60')
			await page
				.getByRole('group', {
					name: 'Har bruker inntekt ved siden av 60 % uttak?',
				})
				.getByLabel('Ja')
				.check()
			await page
				.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt ved siden av 60 % uttak',
				})
				.fill('300000')
			await page
				.getByRole('combobox', { name: 'Alder (år) for 100 % uttak' })
				.selectOption('67')
			await page
				.getByRole('group', {
					name: 'Har bruker inntekt ved siden av 100 % uttak?',
				})
				.getByLabel('Ja')
				.check()
			await page
				.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt ved siden av 100 % uttak',
				})
				.fill('200000')
			await page
				.getByRole('combobox', { name: 'Alder (år) inntekt slutter' })
				.selectOption('70')

			await page.getByRole('button', { name: 'Beregn pensjon' }).click()

			await expect(page.getByText('Sivilstand er påkrevd')).not.toBeVisible()
			await expect(page.getByText('Uttaksgrad er påkrevd')).not.toBeVisible()
		})
	})

	test.describe('Innsending - Med partner', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page, { sivilstand: 'GIFT' })
			await mockApi(page, SIMULERING_API_URL, ALDERSPENSJON_MOCK_FILE)
			await navigateToApp(page)
		})

		test('Sender inn skjema med gift sivilstand og EPS har pensjon', async ({
			page,
		}) => {
			const epsHarPensjonGroup = page.getByRole('group', {
				name: /Vil brukers ektefelle motta pensjon, uføretrygd eller AFP\?/,
			})
			await epsHarPensjonGroup.getByLabel('Ja').check()

			await page
				.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt frem til uttak',
				})
				.fill('500000')
			await page
				.getByRole('combobox', { name: 'Alder (år) for uttak' })
				.selectOption('67')
			await page
				.getByRole('combobox', { name: 'Uttaksgrad' })
				.selectOption('100')
			await page
				.getByRole('group', {
					name: 'Har bruker inntekt ved siden av 100 % uttak?',
				})
				.getByLabel('Nei')
				.check()

			await page.getByRole('button', { name: 'Beregn pensjon' }).click()

			await expect(page.getByText('Sivilstand er påkrevd')).not.toBeVisible()
		})

		test('Sender inn skjema med gift sivilstand, EPS uten pensjon, med inntekt over 2G', async ({
			page,
		}) => {
			const epsHarPensjonGroup = page.getByRole('group', {
				name: /Vil brukers ektefelle motta pensjon, uføretrygd eller AFP\?/,
			})
			await epsHarPensjonGroup.getByLabel('Nei').check()

			const epsInntektGroup = page.getByRole('group', {
				name: /Vil brukers ektefelle ha inntekt over 2G/,
			})
			await epsInntektGroup.getByLabel('Ja').check()

			await page
				.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt frem til uttak',
				})
				.fill('500000')
			await page
				.getByRole('combobox', { name: 'Alder (år) for uttak' })
				.selectOption('67')
			await page
				.getByRole('combobox', { name: 'Uttaksgrad' })
				.selectOption('100')
			await page
				.getByRole('group', {
					name: 'Har bruker inntekt ved siden av 100 % uttak?',
				})
				.getByLabel('Nei')
				.check()

			await page.getByRole('button', { name: 'Beregn pensjon' }).click()

			await expect(page.getByText('Sivilstand er påkrevd')).not.toBeVisible()
		})
	})

	test.describe('Nullstilling av skjema', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)
		})

		test('Nullstiller alle felter ved klikk på Nullstill', async ({ page }) => {
			await page
				.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt frem til uttak',
				})
				.fill('500000')
			await page
				.getByRole('combobox', { name: 'Alder (år) for uttak' })
				.selectOption('67')
			await page
				.getByRole('combobox', { name: 'Uttaksgrad' })
				.selectOption('100')
			await page
				.getByRole('group', {
					name: 'Har bruker inntekt ved siden av 100 % uttak?',
				})
				.getByLabel('Ja')
				.check()
			await page
				.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt ved siden av 100 % uttak',
				})
				.fill('200000')

			await page.getByRole('button', { name: 'Nullstill' }).click()

			await expect(
				page.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt frem til uttak',
				})
			).toHaveValue('')
			await expect(
				page.getByRole('combobox', { name: 'Alder (år) for uttak' })
			).toHaveValue('')
			await expect(
				page.getByRole('combobox', { name: 'Uttaksgrad' })
			).toHaveValue('')

			await expect(
				page.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt ved siden av 100 % uttak',
				})
			).not.toBeVisible()
		})
	})

	test.describe('Alder-velger', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)
		})

		test('Måned-velger er deaktivert før år er valgt', async ({ page }) => {
			await expect(
				page.getByRole('combobox', { name: 'Alder (md.) for uttak' })
			).toBeDisabled()
		})

		test('Måned-velger aktiveres når år er valgt', async ({ page }) => {
			await page
				.getByRole('combobox', { name: 'Alder (år) for uttak' })
				.selectOption('67')

			await expect(
				page.getByRole('combobox', { name: 'Alder (md.) for uttak' })
			).toBeEnabled()
		})

		test('Viser uttaksdato når både år og måned er valgt', async ({ page }) => {
			await page
				.getByRole('combobox', { name: 'Alder (år) for uttak' })
				.selectOption('67')

			await expect(page.getByText(/\d{2}\.\d{2}\.\d{4}/)).toBeVisible()
		})
	})

	test.describe('Partner-betegnelse', () => {
		test('Viser "ektefelle" for Gift', async ({ page }) => {
			await setupDefaultMocks(page, { sivilstand: 'GIFT' })
			await navigateToApp(page)

			await expect(
				page.getByText(/Vil brukers ektefelle motta pensjon/)
			).toBeVisible()
		})

		test('Viser "samboer" for Samboer', async ({ page }) => {
			await setupDefaultMocks(page, { sivilstand: 'SAMBOER' })
			await navigateToApp(page)

			await expect(
				page.getByText(/Vil brukers samboer motta pensjon/)
			).toBeVisible()
		})

		test('Viser "partner" for Registrert partner', async ({ page }) => {
			await setupDefaultMocks(page, {
				sivilstand: 'REGISTRERT_PARTNER',
			})
			await navigateToApp(page)

			await expect(
				page.getByText(/Vil brukers partner motta pensjon/)
			).toBeVisible()
		})
	})
})
