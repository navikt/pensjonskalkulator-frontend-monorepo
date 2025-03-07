import { describe, it } from 'vitest'

import { SanityReadmore } from '@/components/common/SanityReadmore'
import { mockErrorResponse } from '@/mocks/server'
import { render, screen } from '@/test-utils'

describe('SanityReadmore', () => {
  describe('Gitt at Sanity er aktivert og innhold finnes', () => {
    it('rendrer ReadMore med korrekte props og innhold', async () => {
      render(
        <SanityReadmore id="hva_er_opphold_utenfor_norge">
          <div>Child content</div>
        </SanityReadmore>
      )

      const readMoreElement = await screen.findByTestId(
        'hva_er_opphold_utenfor_norge'
      )
      expect(readMoreElement).toBeVisible()

      expect(screen.getByText('Hva som er opphold utenfor Norge')).toBeVisible()
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

      expect(screen.getByText('Fallback innhold')).toBeVisible()

      expect(screen.queryByText('Hva som er opphold utenfor Norge')).toBeNull()
    })
  })

  describe('Gitt at Sanity innhold ikke finnes', () => {
    it('viser fallback innhold når id ikke finnes i readMoreData', async () => {
      render(
        <SanityReadmore id="non-existent-id">
          <p>Fallback innhold</p>
        </SanityReadmore>
      )

      expect(screen.getByText('Fallback innhold')).toBeVisible()

      expect(screen.queryByText('Hva som er opphold utenfor Norge')).toBeNull()
    })
  })
})
