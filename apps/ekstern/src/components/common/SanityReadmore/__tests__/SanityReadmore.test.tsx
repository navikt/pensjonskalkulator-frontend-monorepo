import { PortableText } from '@portabletext/react'
import { describe, it, vi } from 'vitest'

import { SanityReadmore } from '@/components/common/SanityReadmore'
import { mockErrorResponse } from '@/mocks/server'
import { render, screen, waitFor } from '@/test-utils'

vi.mock('@portabletext/react', () => ({
  PortableText: vi.fn(() => (
    <div data-testid="portable-text">Mocked PortableText</div>
  )),
}))

describe('SanityReadmore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Gitt at Sanity er aktivert og innhold finnes', () => {
    it('rendrer ReadMore med korrekte props og innhold', async () => {
      render(
        <SanityReadmore
          id="hva_er_opphold_utenfor_norge"
        >
          <div>Child content</div>
        </SanityReadmore>
      )

	  await waitFor(() => {
		const readMoreElement = screen.getByTestId('hva_er_opphold_utenfor_norge')
		expect(readMoreElement).toBeInTheDocument()
      	expect(readMoreElement).toHaveAttribute(
      	  'data-testid',
      	  'hva_er_opphold_utenfor_norge'
      	)
	  })

	  expect(
		screen.getByText('Hva som er opphold utenfor Norge')
	  ).toBeInTheDocument()

	  expect(PortableText).toHaveBeenCalled()
    })
  })

  describe('Gitt at Sanity er deaktivert', () => {
    it('viser fallback innhold og ikke Sanity innhold', async () => {
      mockErrorResponse('/feature/pensjonskalkulator.hent-tekster-fra-sanity')

      render(
        <SanityReadmore id="hva_er_opphold_utenfor_norge">
          <p>Fallback innhold</p>
        </SanityReadmore>
      )

      await waitFor(() => {
        expect(screen.getByText('Fallback innhold')).toBeInTheDocument()
      })

      expect(
        screen.queryByText('Hva som er opphold utenfor Norge')
      ).not.toBeInTheDocument()
      expect(PortableText).not.toHaveBeenCalled()
    })
  })

  describe('Gitt at Sanity innhold ikke finnes', () => {
    it('viser fallback innhold når id ikke finnes i readMoreData', async () => {
      render(
        <SanityReadmore id="non-existent-id">
          <p>Fallback innhold</p>
        </SanityReadmore>
      )

      await waitFor(() => {
        expect(screen.getByText('Fallback innhold')).toBeInTheDocument()
      })

	  expect(
        screen.queryByText('Hva som er opphold utenfor Norge')
      ).not.toBeInTheDocument()
      expect(PortableText).not.toHaveBeenCalled()
    })
  })
})
