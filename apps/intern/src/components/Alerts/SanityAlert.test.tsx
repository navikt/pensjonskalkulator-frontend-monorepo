import { SanityContext } from '@pensjonskalkulator-frontend-monorepo/sanity'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ContextType } from 'react'
import { IntlProvider } from 'react-intl'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { Button } from '@navikt/ds-react'

import { SanityAlert } from './SanityAlert'

type SanityContextValue = ContextType<typeof SanityContext>

afterEach(() => {
	vi.restoreAllMocks()
	document.getElementById('afp-offentlig-heading')?.remove()
})

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
		{
			linkType: 'anchor',
			href: '#afp-offentlig-heading',
			anchorId: 'afp-offentlig-heading',
			route: undefined,
			blank: false,
		},
		{
			linkType: 'route',
			href: '/pensjon/kalkulator/afp',
			anchorId: undefined,
			route: '/pensjon/kalkulator/afp',
			blank: false,
		},
		{
			linkType: 'external',
			href: 'https://www.spk.no/',
			anchorId: undefined,
			route: undefined,
			blank: true,
		},
	] as const)(
		'renders default $linkType links and uses SPA navigation only for routes',
		({ linkType, href, anchorId, route, blank }) => {
			const onLinkClick = vi.fn()
			const navigateToRoute = vi.fn()
			const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
			const initialHash = window.location.hash
			if (linkType === 'anchor') {
				const target = document.createElement('h3')
				target.id = anchorId
				vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
					top: 120,
				} as DOMRect)
				document.body.append(target)
			}
			const alert = {
				name: 'test-default-link',
				type: 'local-alert',
				status: 'info',
				overskrift: null,
				innhold: [
					{
						_type: 'block',
						_key: 'default-link-block',
						style: 'normal',
						markDefs: [
							{
								_type: 'link',
								_key: 'default-link-mark',
								linkType,
								anchorId,
								route,
								href,
								blank,
							},
						],
						children: [
							{
								_type: 'span',
								_key: 'default-link-text',
								text: 'Les mer',
								marks: ['default-link-mark'],
							},
						],
					},
				],
			} as unknown as SanityContextValue['alertData'][string]
			const contextValue = {
				alertData: { 'test-default-link': alert },
				guidePanelData: {},
				readMoreData: {},
				forbeholdAvsnittData: [],
				isSanityLoading: false,
				navigateToRoute,
			} satisfies SanityContextValue

			render(
				<IntlProvider
					locale="nb"
					messages={{
						'application.global.external_link': 'Opens in a new tab',
					}}
				>
					<SanityContext.Provider value={contextValue}>
						<SanityAlert id="test-default-link" onLinkClick={onLinkClick} />
					</SanityContext.Provider>
				</IntlProvider>
			)

			const link = screen.getByRole('link', { name: /Les mer/ })
			expect(link).toHaveAttribute('href', href)
			if (blank) {
				expect(link).toHaveAttribute('target', '_blank')
			} else {
				expect(link).not.toHaveAttribute('target')
			}

			fireEvent.click(link, { button: 0 })
			expect(onLinkClick).toHaveBeenCalledOnce()
			if (linkType === 'route') {
				expect(navigateToRoute).toHaveBeenCalledWith(route)
				expect(onLinkClick.mock.invocationCallOrder[0]).toBeLessThan(
					navigateToRoute.mock.invocationCallOrder[0]
				)
				onLinkClick.mockClear()
				navigateToRoute.mockClear()
				document.addEventListener('click', (event) => event.preventDefault(), {
					once: true,
				})
				fireEvent.click(link, { button: 0, metaKey: true })
				expect(onLinkClick).toHaveBeenCalledOnce()
				expect(navigateToRoute).not.toHaveBeenCalled()
			} else {
				expect(navigateToRoute).not.toHaveBeenCalled()
			}
			if (linkType === 'anchor') {
				expect(scrollTo).toHaveBeenCalledWith({
					top: 105,
					behavior: 'smooth',
				})
				expect(window.location.hash).toBe(initialHash)
			}
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

	test('renders a preformatted age dynamic value unchanged', () => {
		const alert = {
			name: 'test-age',
			type: 'local-alert',
			status: 'info',
			overskrift: null,
			innhold: [
				{
					_type: 'block',
					_key: 'age-block',
					style: 'normal',
					markDefs: [],
					children: [
						{
							_type: 'dynamicValue',
							_key: 'age-value',
							key: 'alder',
						},
					],
				},
			],
		} as unknown as SanityContextValue['alertData'][string]
		const contextValue = {
			alertData: { 'test-age': alert },
			guidePanelData: {},
			readMoreData: {},
			forbeholdAvsnittData: [],
			isSanityLoading: false,
		} satisfies SanityContextValue

		render(
			<IntlProvider locale="nb" messages={{}}>
				<SanityContext.Provider value={contextValue}>
					<SanityAlert
						id="test-age"
						dynamicValues={{ alder: '63 år og 2 måneder' }}
					/>
				</SanityContext.Provider>
			</IntlProvider>
		)

		expect(screen.getByText('63 år og 2 måneder')).toBeInTheDocument()
	})
})
