import sanityForbeholdAvsnittDataResponse from '@pensjonskalkulator-frontend-monorepo/mocks/data/sanity-forbehold-avsnitt-data.json'
import { describe, it } from 'vitest'

import { render, screen, waitFor } from '@/test-utils'

import { Forbehold } from '..'

describe('Forbehold', () => {
  it('har riktig sidetittel', async () => {
    render(<Forbehold />)

    await waitFor(() => {
      expect(document.title).toBe('application.title.forbehold')
    })
  })

  it('rendrer seksjonene riktig med innhold fra Sanity', async () => {
    render(<Forbehold />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'forbehold.title',
          level: 2,
        })
      ).toBeVisible()
    })

    const dataAvsnitt = sanityForbeholdAvsnittDataResponse.result ?? []
    const avsnittDokuments = screen.getAllByTestId('forbehold-avsnitt')

    expect(avsnittDokuments).toHaveLength(dataAvsnitt.length)

    avsnittDokuments.forEach((avsnittDokument) => {
      const paragraphs = avsnittDokument.querySelectorAll('p')
      expect(paragraphs.length).toBeGreaterThan(0)

      paragraphs.forEach((paragraph) => {
        expect(paragraph.textContent?.trim()).not.toBe('')
      })
    })
  })
})
