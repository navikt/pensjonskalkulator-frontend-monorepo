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
        hasAfpOffentlig={false}
        show1963Text={false}
      />
    )
    await waitFor(() => {
      expect(
        screen.queryByText('tidligsteuttaksalder.1963.ingress_1')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('tidligsteuttaksalder.1964.ingress_1')
      ).toBeInTheDocument()
      expect(
        screen.getByText('62 alder.aar string.og 9 alder.maaneder', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.queryByText('tidligsteuttaksalder.1963.ingress_2')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('tidligsteuttaksalder.1964.ingress_2')
      ).toBeInTheDocument()
    })
    await user.click(screen.getByText('tidligsteuttaksalder.readmore_title'))
    expect(
      screen.getByText(
        'Den oppgitte alderen er et estimat etter dagens regler.',
        { exact: false }
      )
    ).toBeInTheDocument()
  })

  it('viser riktig ingress når brukeren er født i 1963', async () => {
    render(
      <TidligstMuligUttaksalder
        tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
        hasAfpOffentlig={false}
        show1963Text
      />
    )
    await waitFor(() => {
      expect(
        screen.getByText('tidligsteuttaksalder.1963.ingress_1')
      ).toBeInTheDocument()
      expect(
        screen.queryByText('tidligsteuttaksalder.1964.ingress_1')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('62 alder.aar string.og 9 alder.maaneder', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('tidligsteuttaksalder.1963.ingress_2')
      ).toBeInTheDocument()
      expect(
        screen.queryByText('tidligsteuttaksalder.1964.ingress_2')
      ).not.toBeInTheDocument()
    })
  })

  it('viser ikke AFP melding når brukeren ikke har valgt AFP-offentlig', async () => {
    render(
      <TidligstMuligUttaksalder
        tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
        hasAfpOffentlig={false}
        show1963Text={false}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText('62 alder.aar string.og 9 alder.maaneder', {
          exact: false,
        })
      ).toBeInTheDocument()

      expect(
        screen.queryByText('tidligsteuttaksalder.info_afp')
      ).not.toBeInTheDocument()
    })
  })

  it('viser ikke AFP melding når brukeren har valgt AFP-offentlig, men at tidligstMuligUttak er 62', async () => {
    render(
      <TidligstMuligUttaksalder
        tidligstMuligUttak={{ aar: 62, maaneder: 0 }}
        hasAfpOffentlig={true}
        show1963Text={false}
      />
    )
    await waitFor(() => {
      expect(
        screen.queryByText('tidligsteuttaksalder.info_afp')
      ).not.toBeInTheDocument()
    })
  })

  it('viser AFP melding når brukeren har AFP offentlig og tidligstMuligUttak etter 62', async () => {
    render(
      <TidligstMuligUttaksalder
        tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
        hasAfpOffentlig={true}
        show1963Text={false}
      />
    )
    await waitFor(() => {
      expect(
        screen.getByText('tidligsteuttaksalder.info_afp')
      ).toBeInTheDocument()
    })
  })

  it('viser feilmelding og readmore når tidligstMuligUttak ikke kunne hentes', async () => {
    render(
      <TidligstMuligUttaksalder
        tidligstMuligUttak={undefined}
        hasAfpOffentlig={false}
        show1963Text={false}
      />
    )
    await waitFor(() => {
      expect(screen.getByText('tidligsteuttaksalder.error')).toBeInTheDocument()
      expect(
        screen.getByText('tidligsteuttaksalder.readmore_title')
      ).toBeInTheDocument()
    })
  })
})
