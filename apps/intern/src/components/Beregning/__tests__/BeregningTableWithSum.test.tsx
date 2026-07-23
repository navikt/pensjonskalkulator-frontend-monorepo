import { render, screen, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { BeregningTableWithSum } from '../BeregningTableWithSum'

describe('BeregningTableWithSum', () => {
	test('viser angitt sumtekst uten kr i sumverdien', () => {
		render(
			<BeregningTableWithSum
				title="100 % alderspensjon"
				valueHeader="Kr per måned"
				rows={[{ label: 'Grunnpensjon', value: 1000 }]}
				sumLabel="Sum alderspensjon"
				visAarsbelop={false}
			/>
		)

		const sumRow = screen.getByRole('row', { name: /Sum alderspensjon/ })
		expect(
			within(sumRow).getByRole('cell', { name: 'Sum alderspensjon' })
		).toBeVisible()
		expect(within(sumRow).getByRole('cell', { name: '1 000' })).toBeVisible()
		expect(within(sumRow).queryByText(/kr/)).not.toBeInTheDocument()
	})
})
