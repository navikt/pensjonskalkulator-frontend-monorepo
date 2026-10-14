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

	test.each([undefined, null, '', '   ', 'CMS-tekst'])(
		'preserves the action with CMS label %j and falls back to app text',
		(buttonLabel) => {
			const action = vi.fn()
			const alert = {
				name: 'test-action-alert',
				type: 'local-alert',
				status: 'error',
				overskrift: 'Lagring feilet',
				...(buttonLabel === undefined ? {} : { buttonLabel }),
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
							<Button onClick={action}>Prøv på nytt</Button>
						</SanityAlert>
					</SanityContext.Provider>
				</IntlProvider>
			)

			const expectedLabel = buttonLabel?.trim() || 'Prøv på nytt'
			const button = screen.getByRole('button', { name: expectedLabel })
			expect(button).toBeInTheDocument()
			fireEvent.click(button)
			expect(action).toHaveBeenCalledOnce()
		}
	)

	test.each([
		{ valueType: 'internalLink', openInNewTab: false, href: '#details' },
		{ valueType: 'internalLink', openInNewTab: true, href: '#details' },
		{ valueType: 'externalLink', openInNewTab: false, href: 'https://nav.no' },
		{ valueType: 'externalLink', openInNewTab: true, href: 'https://nav.no' },
	])(
		'renders labeled $valueType with openInNewTab=$openInNewTab',
		({ valueType, openInNewTab, href }) => {
			const action = vi.fn()
			const iconTitle = 'Opens in a new tab'
			const alert = {
				name: 'test-link',
				type: 'local-alert',
				innhold: [
					{
						_type: 'block',
						_key: 'link-block',
						style: 'normal',
						markDefs: [],
						children: [
							{
								_type: 'dynamicValue',
								_key: 'link-value',
								valueType,
								label: 'Read more',
								anchorId: 'details',
								url: 'https://nav.no',
								openInNewTab,
							},
						],
					},
				],
			} as unknown as SanityContextValue['alertData'][string]
			const contextValue = {
				alertData: { 'test-link': alert },
				guidePanelData: {},
				readMoreData: {},
				forbeholdAvsnittData: [],
				isSanityLoading: false,
			} satisfies SanityContextValue

			render(
				<IntlProvider
					locale="nb"
					messages={{ 'application.global.external_link': iconTitle }}
				>
					<SanityContext.Provider value={contextValue}>
						<SanityAlert id="test-link" onLinkClick={action} />
					</SanityContext.Provider>
				</IntlProvider>
			)

			const link = screen.getByRole('link', { name: /Read more/ })
			expect(link).toHaveAttribute('href', href)
			expect(screen.getByText('Read more')).toBeInTheDocument()
			expect(screen.queryByText('details')).not.toBeInTheDocument()
			expect(screen.queryByText('https://nav.no')).not.toBeInTheDocument()
			if (openInNewTab) {
				expect(link).toHaveAttribute('target', '_blank')
				expect(screen.getByTitle(iconTitle)).toBeInTheDocument()
			} else {
				expect(link).not.toHaveAttribute('target')
				expect(screen.queryByTitle(iconTitle)).not.toBeInTheDocument()
				expect(link).toHaveAccessibleName('Read more')
			}
			link.addEventListener('click', (event) => event.preventDefault())
			fireEvent.click(link)
			expect(action).toHaveBeenCalledOnce()
		}
	)

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
