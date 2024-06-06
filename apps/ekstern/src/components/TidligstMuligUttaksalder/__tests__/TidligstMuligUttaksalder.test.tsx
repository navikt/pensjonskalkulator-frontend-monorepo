import { describe, it } from 'vitest'

import { TidligstMuligUttaksalder } from '..'
import { render, screen, waitFor, userEvent } from '@/test-utils'
import { loggerTeardown } from '@/utils/__tests__/logging-stub'

describe('TidligstMuligUttaksalder', () => {
  afterEach(() => {
    loggerTeardown()
  })

  it('viser riktig ingress når brukeren er født etter 1963', async () => {
    const user = userEvent.setup()
    render(
      <TidligstMuligUttaksalder
        tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
        show1963Text={false}
      />
    )
    await waitFor(() => {
      expect(
        screen.getByText('Din opptjening gjør at du tidligst kan ta ut', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('62 alder.aar string.og 9 alder.maaneder', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.queryByText('tidligstmuliguttak.1963.ingress_2')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('tidligstmuliguttak.1964.ingress_2')
      ).toBeInTheDocument()
    })
    await user.click(
      screen.getByText('beregning.read_more.pensjonsalder.label')
    )
    expect(
      screen.getByText('beregning.read_more.pensjonsalder.body.optional', {
        exact: false,
      })
    ).toBeInTheDocument()
  })

  it('viser riktig ingress når brukeren er født i 1963', async () => {
    render(
      <TidligstMuligUttaksalder
        tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
        show1963Text
      />
    )
    await waitFor(() => {
      expect(
        screen.queryByText('Din opptjening gjør at du tidligst kan ta ut', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('62 alder.aar string.og 9 alder.maaneder', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('tidligstmuliguttak.1963.ingress_2')
      ).toBeInTheDocument()
      expect(
        screen.queryByText('tidligstmuliguttak.1964.ingress_2')
      ).not.toBeInTheDocument()
    })
  })

  it('viser readmore med riktig tekst når tidligstMuligUttak kunne hentes', async () => {
    render(
      <TidligstMuligUttaksalder
        tidligstMuligUttak={{ aar: 65, maaneder: 3 }}
        show1963Text={false}
      />
    )
    expect(
      screen.queryByText('tidligstmuliguttak.error')
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('beregning.read_more.pensjonsalder.label')
    ).toBeInTheDocument()
    expect(
      screen.getByText('beregning.read_more.pensjonsalder.body.optional', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Aldersgrensene vil øke gradvis fra 1964-kullet', {
        exact: false,
      })
    ).toBeInTheDocument()
  })

  it('viser readmore med riktig tekst når tidligstMuligUttak ikke kunne hentes', async () => {
    render(
      <TidligstMuligUttaksalder
        tidligstMuligUttak={undefined}
        show1963Text={false}
      />
    )

    expect(screen.getByText('tidligstmuliguttak.error')).toBeInTheDocument()
    expect(
      screen.getByText('beregning.read_more.pensjonsalder.label')
    ).toBeInTheDocument()
    expect(
      screen.queryByText('beregning.read_more.pensjonsalder.body.optional')
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('Aldersgrensene vil øke gradvis fra 1964-kullet', {
        exact: false,
      })
    ).toBeInTheDocument()
  })
})
