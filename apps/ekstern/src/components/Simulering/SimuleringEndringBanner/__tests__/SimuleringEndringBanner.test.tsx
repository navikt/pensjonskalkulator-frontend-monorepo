import { fulfilledGetLoependeVedtakLoependeAlderspensjon } from '@/mocks/mockedRTKQueryApiCalls'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen } from '@/test-utils'

import { SimuleringEndringBanner } from '../SimuleringEndringBanner'

describe('SimuleringEndringBanner', () => {
  it('Gitt at brukeren ikke har noe vedtak om alderspensjon, skal banneren ikke vises.', () => {
    render(<SimuleringEndringBanner isLoading={false} heltUttaksalder={null} />)
    expect(
      screen.queryByText('beregning.avansert.endring_banner.title')
    ).not.toBeInTheDocument()
  })

  describe('Gitt at brukeren har et vedtak om alderspensjon,', () => {
    const preloadedQueries = {
      api: {
        queries: {
          ...fulfilledGetLoependeVedtakLoependeAlderspensjon,
        },
      },
    }

    it('Når heltUttaksalder er null, skal banneren ikke vises.', () => {
      render(
        <SimuleringEndringBanner isLoading={false} heltUttaksalder={null} />,
        {
          // @ts-ignore
          preloadedState: {
            ...preloadedQueries,
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )
      expect(
        screen.queryByText('beregning.avansert.endring_banner.title')
      ).not.toBeInTheDocument()
    })

    it('Når heltUttaksalder er satt, skal banneren vises med riktig tekst.', async () => {
      render(
        <SimuleringEndringBanner
          isLoading={false}
          heltUttaksalder={{ aar: 67, maaneder: 0 }}
        />,
        {
          // @ts-ignore
          preloadedState: {
            ...preloadedQueries,
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )
      expect(
        screen.getByText('beregning.avansert.endring_banner.title', {
          exact: false,
        })
      ).toBeVisible()

      expect(screen.getByText('67 alder.aar', { exact: false })).toBeVisible()
      expect(screen.getByText('(100 %)', { exact: false })).toBeVisible()
      expect(
        screen.getByText('beregning.avansert.endring_banner.kr_md', {
          exact: false,
        })
      ).toBeVisible()
      expect(
        screen.getAllByText('beregning.avansert.endring_banner.kr_md', {
          exact: false,
        })
      ).toHaveLength(1)
    })

    it('Når heltUttaksalder er satt med alderspensjonMaanedligVedEndring, skal banneren vises med riktig tekst.', async () => {
      render(
        <SimuleringEndringBanner
          isLoading={false}
          heltUttaksalder={{ aar: 67, maaneder: 0 }}
          alderspensjonMaanedligVedEndring={{
            heltUttakMaanedligBeloep: 100000,
          }}
        />,
        {
          // @ts-ignore
          preloadedState: {
            ...preloadedQueries,
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )
      expect(
        screen.getByText('beregning.avansert.endring_banner.title', {
          exact: false,
        })
      ).toBeVisible()

      expect(screen.getByText('67 alder.aar', { exact: false })).toBeVisible()
      expect(screen.getByText('(100 %)', { exact: false })).toBeVisible()
      expect(
        screen.getByText('beregning.avansert.endring_banner.kr_md', {
          exact: false,
        })
      ).toBeVisible()
      expect(
        screen.getAllByText('beregning.avansert.endring_banner.kr_md', {
          exact: false,
        })
      ).toHaveLength(1)
    })

    it('Når heltUttaksalder og gradertUttaksperiode er satt, skal banneren vises med riktig tekst.', async () => {
      render(
        <SimuleringEndringBanner
          isLoading={false}
          heltUttaksalder={{ aar: 67, maaneder: 0 }}
          gradertUttaksperiode={{
            uttaksalder: { aar: 62, maaneder: 0 },
            grad: 50,
          }}
          alderspensjonMaanedligVedEndring={{
            heltUttakMaanedligBeloep: 100000,
            gradertUttakMaanedligBeloep: 50000,
          }}
        />,
        {
          // @ts-ignore
          preloadedState: {
            ...preloadedQueries,
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )
      expect(screen.getByText('62 alder.aar', { exact: false })).toBeVisible()
      expect(screen.getByText('(50 %)', { exact: false })).toBeVisible()
      expect(
        screen.getAllByText('beregning.avansert.endring_banner.kr_md', {
          exact: false,
        })
      ).toHaveLength(2)
      expect(screen.getByText('67 alder.aar', { exact: false })).toBeVisible()
      expect(screen.getByText('(100 %)', { exact: false })).toBeVisible()
    })
  })
})
