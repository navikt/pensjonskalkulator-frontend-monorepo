import { SanityContext } from '@pensjonskalkulator-frontend-monorepo/sanity'
import { render, screen } from '@testing-library/react'
import type { ContextType } from 'react'
import { IntlProvider } from 'react-intl'
import { describe, expect, test } from 'vitest'

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
})
