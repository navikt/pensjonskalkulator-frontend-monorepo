import { describe, it } from 'vitest'

import { render, screen } from '@/test-utils'
import * as useIsMobileUtils from '@/utils/useIsMobile'

import pensjonsavtalerData from '../../../../mocks/data/pensjonsavtaler/67.json' with { type: 'json' }
import { PrivatePensjonsavtaler } from '../PrivatePensjonsavtaler'

describe('PrivatePensjonsavtaler', () => {
  const avtalerWithKeys = pensjonsavtalerData.avtaler.map(
    (avtale, index) =>
      ({
        ...avtale,
        key: index,
      }) as Pensjonsavtale
  )

  describe('Gitt at pensjonsavtaler er hentet, ', async () => {
    it('Når brukeren er på desktop, viser riktig informasjon og liste over private pensjonsavtaler.', async () => {
      vi.spyOn(useIsMobileUtils, 'useIsMobile').mockReturnValue(false)

      render(
        <PrivatePensjonsavtaler
          headingLevel="3"
          isPartialResponse={false}
          isSuccess
          privatePensjonsavtaler={avtalerWithKeys}
        />
      )
      expect(await screen.findByTestId('private-pensjonsavtaler')).toBeVisible()
      expect(
        await screen.findByTestId('private-pensjonsavtaler-desktop')
      ).toBeVisible()

      expect(
        await screen.findByText('Avtaler fra privat sektor hentes fra ', {
          exact: false,
        })
      ).toBeVisible()
    })

    it('Når brukeren er på mobil, viser riktig informasjon og liste over private pensjonsavtaler.', async () => {
      vi.spyOn(useIsMobileUtils, 'useIsMobile').mockReturnValue(true)
      render(
        <PrivatePensjonsavtaler
          headingLevel="3"
          isPartialResponse={false}
          isSuccess
          privatePensjonsavtaler={avtalerWithKeys}
        />
      )
      expect(await screen.findByTestId('private-pensjonsavtaler')).toBeVisible()
      expect(
        await screen.findByTestId('private-pensjonsavtaler-mobile')
      ).toBeVisible()

      expect(
        await screen.findByText('Avtaler fra privat sektor hentes fra ', {
          exact: false,
        })
      ).toBeVisible()
    })
  })

  it('Når pensjonsavtaler har delvis svar med avtaler, viser riktig informasjon og liste over private pensjonsavtaler.', async () => {
    render(
      <PrivatePensjonsavtaler
        headingLevel="3"
        isPartialResponse={true}
        isSuccess
        privatePensjonsavtaler={avtalerWithKeys}
      />
    )

    expect(
      await screen.findByText(
        'pensjonsavtaler.private.ingress.error.pensjonsavtaler.partial'
      )
    ).toBeVisible()
    expect(screen.queryByTestId('private-pensjonsavtaler')).toBeInTheDocument()
    expect(
      await screen.findByText('Avtaler fra privat sektor hentes fra ', {
        exact: false,
      })
    ).toBeVisible()
    expect(await screen.findByTestId('private-pensjonsavtaler')).toBeVisible()
  })

  it('Når pensjonsavtaler har delvis svar og ingen avtaler, viser riktig informasjon uten liste over private pensjonsavtaler.', async () => {
    render(
      <PrivatePensjonsavtaler
        headingLevel="3"
        isPartialResponse={true}
        isSuccess
        privatePensjonsavtaler={[]}
      />
    )

    expect(
      await screen.findByText('pensjonsavtaler.private.title.ingen')
    ).toBeVisible()
    expect(
      await screen.findByText(
        'pensjonsavtaler.private.ingress.error.pensjonsavtaler'
      )
    ).toBeVisible()

    expect(
      await screen.findByText('Avtaler fra privat sektor hentes fra ', {
        exact: false,
      })
    ).toBeVisible()
    expect(
      screen.queryByTestId('private-pensjonsavtaler')
    ).not.toBeInTheDocument()
  })

  it('Når pensjonsavtaler har feilet, viser riktig feilmelding uten liste over private pensjonsavtaler.', async () => {
    render(
      <PrivatePensjonsavtaler
        headingLevel="3"
        isPartialResponse={false}
        isSuccess={false}
        isError
        privatePensjonsavtaler={[]}
      />
    )

    expect(
      await screen.findByText('pensjonsavtaler.private.title.ingen')
    ).toBeVisible()
    expect(
      await screen.findByText(
        'pensjonsavtaler.private.ingress.error.pensjonsavtaler'
      )
    ).toBeVisible()
    expect(
      screen.queryByTestId('private-pensjonsavtaler')
    ).not.toBeInTheDocument()
    expect(
      await screen.findByText('Avtaler fra privat sektor hentes fra ', {
        exact: false,
      })
    ).toBeVisible()
    expect(
      screen.queryByTestId('private-pensjonsavtaler')
    ).not.toBeInTheDocument()
  })

  it('Når brukeren har 0 pensjonsavtaler, viser riktig infomelding uten liste over private pensjonsavtaler.', async () => {
    render(
      <PrivatePensjonsavtaler
        headingLevel="3"
        isPartialResponse={false}
        isSuccess
        privatePensjonsavtaler={[]}
      />
    )
    expect(
      await screen.findByText('pensjonsavtaler.private.title.ingen')
    ).toBeVisible()
    expect(
      await screen.findByText('pensjonsavtaler.ingress.ingen')
    ).toBeVisible()
    expect(
      screen.queryByTestId('private-pensjonsavtaler-desktop')
    ).not.toBeInTheDocument()
    expect(
      await screen.findByText('Avtaler fra privat sektor hentes fra ', {
        exact: false,
      })
    ).toBeVisible()
    expect(
      screen.queryByTestId('private-pensjonsavtaler')
    ).not.toBeInTheDocument()
  })
})
