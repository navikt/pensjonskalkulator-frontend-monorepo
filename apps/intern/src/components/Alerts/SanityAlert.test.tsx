import { SanityContext } from '@pensjonskalkulator-frontend-monorepo/sanity'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ContextType } from 'react'
import { IntlProvider } from 'react-intl'
import { describe, expect, test, vi } from 'vitest'

import { Button } from '@navikt/ds-react'

import { SanityAlert } from './SanityAlert'

type SanityContextValue = ContextType<typeof SanityContext>

function renderInfoCard(
	infoCardStatus: string | null,
	status = 'info',
	overskrift: string | null = null
) {
	const alert = {
		name: 'test-info-card',
		type: 'info-card',
		status,
		infoCardStatus,
		overskrift,
		innhold: [],
	} as unknown as SanityContextValue['alertData'][string]

	const contextValue = {
		alertData: { 'test-info-card': alert },
		guidePanelData: {},
		readMoreData: {},
		forbeholdAvsnittData: [],
		isSanityLoading: false,
	} satisfies SanityContextValue

	return render(
		<IntlProvider locale="nb" messages={{}}>
			<SanityContext.Provider value={contextValue}>
				<SanityAlert id="test-info-card" />
			</SanityContext.Provider>
		</IntlProvider>
	)
}

describe('SanityAlert InfoCard status', () => {
	test.each([
		{ status: 'message', color: 'info', title: undefined },
		{ status: 'attention', color: 'warning', title: 'Pass på' },
		{ status: 'tips', color: 'info', title: 'Tips' },
	])('renders $status status', ({ status, color, title }) => {
		renderInfoCard(status)

		expect(screen.getByTestId('test-info-card')).toHaveAttribute(
			'data-color',
			color
		)
		if (title) {
			expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
		} else {
			expect(screen.queryByRole('heading')).not.toBeInTheDocument()
		}
	})

	test('uses the custom heading for attention and tips', () => {
		renderInfoCard('attention', 'info', 'Egen overskrift')

		expect(
			screen.getByRole('heading', { name: 'Egen overskrift' })
		).toBeInTheDocument()
	})

	test('preserves the legacy status when the InfoCard status is missing', () => {
		renderInfoCard(null, 'warning')

		expect(screen.getByTestId('test-info-card')).toHaveAttribute(
			'data-color',
			'warning'
		)
	})

	test('provides the CMS button label to app-rendered children', () => {
		const action = vi.fn()
		const alert = {
			name: 'test-action-alert',
			type: 'local-alert',
			status: 'error',
			overskrift: 'Lagring feilet',
			buttonLabel: 'Prøv på nytt',
			innhold: [],
		} as unknown as SanityContextValue['alertData'][string]
		const contextValue = {
			alertData: { 'test-action-alert': alert },
			guidePanelData: {},
			readMoreData: {},
			forbeholdAvsnittData: [],
			isSanityLoading: false,
		} satisfies SanityContextValue

		render(
			<IntlProvider locale="nb" messages={{}}>
				<SanityContext.Provider value={contextValue}>
					<SanityAlert id="test-action-alert">
						<Button data-testid="lagre-brev-feil-retry" onClick={action} />
					</SanityAlert>
				</SanityContext.Provider>
			</IntlProvider>
		)

		const button = screen.getByRole('button', { name: 'Prøv på nytt' })
		expect(screen.getAllByText('Prøv på nytt')).toHaveLength(1)
		expect(button).toHaveAttribute('data-testid', 'lagre-brev-feil-retry')
		fireEvent.click(button)
		expect(action).toHaveBeenCalledOnce()
	})

	test('keeps explicit app button text over the Sanity label', () => {
		const alert = {
			name: 'test-action-alert',
			type: 'local-alert',
			status: 'error',
			overskrift: 'Lagring feilet',
			buttonLabel: 'CMS-tekst',
			innhold: [],
		} as unknown as SanityContextValue['alertData'][string]
		const contextValue = {
			alertData: { 'test-action-alert': alert },
			guidePanelData: {},
			readMoreData: {},
			forbeholdAvsnittData: [],
			isSanityLoading: false,
		} satisfies SanityContextValue

		render(
			<IntlProvider locale="nb" messages={{}}>
				<SanityContext.Provider value={contextValue}>
					<SanityAlert id="test-action-alert">
						<Button>App-tekst</Button>
					</SanityAlert>
				</SanityContext.Provider>
			</IntlProvider>
		)

		expect(
			screen.getByRole('button', { name: 'App-tekst' })
		).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'CMS-tekst' })).toBeNull()
	})

	test.each(['1', '2', '3'])(
		'renders %sG using the app-provided value',
		(multiplier) => {
			const alert = {
				name: 'test-g-multiple',
				type: 'local-alert',
				status: 'info',
				overskrift: null,
				innhold: [
					{
						_type: 'block',
						_key: 'g-multiple-block',
						style: 'normal',
						markDefs: [],
						children: [
							{
								_type: 'dynamicValue',
								_key: 'g-multiple-value',
								valueType: 'gMultiple',
								gMultiplier: multiplier,
							},
						],
					},
				],
			} as unknown as SanityContextValue['alertData'][string]
			const contextValue = {
				alertData: { 'test-g-multiple': alert },
				guidePanelData: {},
				readMoreData: {},
				forbeholdAvsnittData: [],
				isSanityLoading: false,
			} satisfies SanityContextValue

			render(
				<IntlProvider locale="nb" messages={{}}>
					<SanityContext.Provider value={contextValue}>
						<SanityAlert id="test-g-multiple" dynamicValues={{ G: 2 }} />
					</SanityContext.Provider>
				</IntlProvider>
			)

			expect(
				screen.getByText(String(2 * Number(multiplier)))
			).toBeInTheDocument()
		}
	)
})
