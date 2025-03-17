import { describe, it } from 'vitest'

import { SanityReadmore } from '@/components/common/SanityReadmore'
import { mockErrorResponse } from '@/mocks/server'
import { render, screen } from '@/test-utils'

describe('SanityReadmore', () => {
  describe('Gitt at Sanity er aktivert og innhold finnes', () => {
    it('rendrer ReadMore med korrekte props og innhold når children finnes', async () => {
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

      expect(screen.getByText('Lorem')).toBeInTheDocument()
      expect(screen.queryByText('Child content')).not.toBeInTheDocument()
    })

    it('rendrer ReadMore med korrekte props og innhold når children ikke finnes', async () => {
      render(<SanityReadmore id="hva_er_opphold_utenfor_norge" />)

      const readMoreElement = await screen.findByTestId(
        'hva_er_opphold_utenfor_norge'
      )
      expect(readMoreElement).toBeVisible()

      expect(screen.getByText('Hva som er opphold utenfor Norge')).toBeVisible()
      expect(screen.getByText('Lorem')).toBeInTheDocument()
    })
  })

  describe('Gitt at Sanity er deaktivert', () => {
    it('viser fallback innhold og ikke Sanity innhold når children finnes', async () => {
      mockErrorResponse('/feature/pensjonskalkulator.hent-tekster-fra-sanity')

      render(
        <SanityReadmore id="hva_er_opphold_utenfor_norge">
          <p>Fallback innhold</p>
        </SanityReadmore>
      )

      expect(screen.getByText('Fallback innhold')).toBeVisible()
      expect(screen.queryByText('Hva som er opphold utenfor Norge')).toBeNull()
    })

    it('viser Sanity innhold når children ikke finnes, selv om feature toggle er deaktivert', async () => {
      mockErrorResponse('/feature/pensjonskalkulator.hent-tekster-fra-sanity')

      render(<SanityReadmore id="hva_er_opphold_utenfor_norge" />)

      const readMoreElement = await screen.findByTestId(
        'hva_er_opphold_utenfor_norge'
      )
      expect(readMoreElement).toBeVisible()

      expect(screen.getByText('Hva som er opphold utenfor Norge')).toBeVisible()
      expect(screen.getByText('Lorem')).toBeInTheDocument()
    })
  })

  describe('Gitt at Sanity innhold ikke finnes', () => {
    it('viser fallback innhold når id ikke finnes i readMoreData og children finnes', async () => {
      render(
        <SanityReadmore id="non-existent-id">
          <p>Fallback innhold</p>
        </SanityReadmore>
      )

      expect(screen.getByText('Fallback innhold')).toBeVisible()
      expect(screen.queryByText('Hva som er opphold utenfor Norge')).toBeNull()
    })

    it('kaster runtime error når id ikke finnes i readMoreData og children ikke finnes', async () => {
      expect(() => {
        render(<SanityReadmore id="non-existent-id" />)
      }).toThrow()
    })
  })
})
