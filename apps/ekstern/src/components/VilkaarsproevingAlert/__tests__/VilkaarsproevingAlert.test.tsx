import { IntlProvider } from 'react-intl'
import { describe, it } from 'vitest'

import { personMock } from '@/mocks'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen } from '@/test-utils'
import nb from '@/translations/nb'

import { VilkaarsproevingAlert } from '..'

describe('VilkaarsproevingAlert', () => {
  describe('Uten gradert uføretrygd eller ikke valgt å beregne AFP', () => {
    const uttaksalder = { aar: 63, maaneder: 3 }
    const alternativ = {
      gradertUttaksalder: undefined,
      uttaksgrad: undefined,
      heltUttaksalder: { aar: 65, maaneder: 3 },
    }
    const mockedState = {
      userInput: {
        ...userInputInitialState,
      },
    }

    it('Når det foreslåtte alternativet er den default normert pensjonsalder, vises det riktig tekst', () => {
      render(
        <IntlProvider locale="nb" messages={nb}>
          <VilkaarsproevingAlert
            alternativ={{
              ...alternativ,
              heltUttaksalder: {
                aar: 67,
                maaneder: 0,
              },
            }}
            uttaksalder={uttaksalder}
          />
        </IntlProvider>,
        {
          // @ts-ignore
          preloadedState: {
            ...mockedState,
          },
          preloadedApiState: { getPerson: personMock },
        }
      )
      const alert = screen.getByTestId(
        'beregning.vilkaarsproeving.ikke_nok_opptjening'
      )
      expect(alert).toHaveTextContent(
        'Et alternativ er at du ved 67 år kan ta ut 100 % alderspensjon.'
      )
      expect(screen.getAllByRole('alert')).toHaveLength(1)
    })

    it.each([
      {
        variant: 'helt uttak',
        alternativ,
        grad: 100,
      },
      {
        variant: 'gradert uttak',
        alternativ: {
          ...alternativ,
          heltUttaksalder: uttaksalder,
          gradertUttaksalder: { aar: 65, maaneder: 3 },
          uttaksgrad: 40,
        },
        grad: 40,
      },
    ])(
      'viser samme Sanity-varsel med riktig alder og grad for $variant',
      ({ alternativ: alternativForTest, grad }) => {
        render(
          <IntlProvider locale="nb" messages={nb}>
            <VilkaarsproevingAlert
              alternativ={alternativForTest}
              uttaksalder={uttaksalder}
            />
          </IntlProvider>,
          {
            preloadedApiState: { getPerson: personMock },
          }
        )

        const alert = screen.getByTestId(
          'beregning.vilkaarsproeving.ikke_nok_opptjening'
        )
        expect(alert).toBeVisible()
        expect(alert).toHaveTextContent(
          `Et alternativ er at du ved 65 år og 3 måneder kan ta ut ${grad} % alderspensjon. Prøv gjerne andre kombinasjoner.`
        )
        expect(screen.getAllByRole('alert')).toHaveLength(1)
      }
    )

    it('Når det foreslåtte alternativet er ulik uttaksalder med ny gradering, vises det riktig tekst', () => {
      render(
        <IntlProvider locale="nb" messages={nb}>
          <VilkaarsproevingAlert
            alternativ={{
              ...alternativ,
              gradertUttaksalder: { aar: 68, maaneder: 5 },
              uttaksgrad: 40,
            }}
            uttaksalder={uttaksalder}
          />
        </IntlProvider>,
        {
          // @ts-ignore
          preloadedState: {
            ...mockedState,
          },
          preloadedApiState: { getPerson: personMock },
        }
      )

      const alert = screen.getByTestId(
        'beregning.vilkaarsproeving.ikke_nok_opptjening_gradert'
      )
      expect(alert).toHaveTextContent(
        'Et alternativ er at du ved 68 år og 5 måneder kan ta ut 40 % alderspensjon hvis du tar ut 100 % alderspensjon ved 65 år og 3 måneder eller senere. Prøv gjerne andre kombinasjoner.'
      )
      expect(screen.getAllByRole('alert')).toHaveLength(1)
    })
  })

  describe('Når brukeren har gradert uføretrygd og har valgt å beregne med AFP', () => {
    const uttaksalder = { aar: 67, maaneder: 3 }
    const nedreAldersgrense = { aar: 64, maaneder: 2 }
    const normertPensjoneringsalder = { aar: 68, maaneder: 1 }
    const person = {
      ...personMock,
      pensjoneringAldre: {
        ...personMock.pensjoneringAldre,
        nedreAldersgrense,
        normertPensjoneringsalder,
      },
    }

    it.each([
      {
        variant: 'gradert uttak med uendret helt uttaksalder',
        heltUttaksalder: uttaksalder,
        gradertUttaksperiode: { grad: 80, uttaksalder: nedreAldersgrense },
        grad: 60,
        alertId: 'beregning.vilkaarsproeving.medAFP.gradertUttak',
        intro:
          'Opptjeningen din er ikke høy nok til ønsket uttak. Du må endre valgene dine.',
        forslag:
          'Et alternativ er at du ved 64 år og 2 måneder kan ta ut 60 % alderspensjon. Prøv gjerne andre kombinasjoner.',
      },
      {
        variant: 'gradert uttak med senere helt uttaksalder',
        heltUttaksalder: { aar: 68, maaneder: 1 },
        gradertUttaksperiode: { grad: 80, uttaksalder: nedreAldersgrense },
        grad: 60,
        alertId: 'beregning.vilkaarsproeving.medAFP.heltOgGradertUttak',
        intro:
          'Opptjeningen din er ikke høy nok til ønsket uttak. Du må sette ned uttaksgraden.',
        forslag:
          'Et alternativ er at du ved 64 år og 2 måneder kan ta ut 60 % alderspensjon, hvis du tar ut 100 % alderspensjon ved 68 år og 1 måned eller senere. Prøv gjerne andre kombinasjoner.',
      },
      {
        variant: '100 % uttak med forslag om lavere grad og senere helt uttak',
        heltUttaksalder: { aar: 68, maaneder: 1 },
        gradertUttaksperiode: null,
        grad: 40,
        alertId: 'beregning.vilkaarsproeving.medAFP.heltOgGradertUttak',
        intro:
          'Opptjeningen din er ikke høy nok til ønsket uttak. Du må sette ned uttaksgraden.',
        forslag:
          'Et alternativ er at du ved 64 år og 2 måneder kan ta ut 40 % alderspensjon, hvis du tar ut 100 % alderspensjon ved 68 år og 1 måned eller senere. Prøv gjerne andre kombinasjoner.',
      },
      {
        variant: 'uendret grad selv om helt uttak er senere',
        heltUttaksalder: { aar: 68, maaneder: 1 },
        gradertUttaksperiode: { grad: 80, uttaksalder: nedreAldersgrense },
        grad: 80,
        alertId: 'beregning.vilkaarsproeving.medAFP.gradertUttak',
        intro:
          'Opptjeningen din er ikke høy nok til ønsket uttak. Du må endre valgene dine.',
        forslag:
          'Et alternativ er at du ved 64 år og 2 måneder kan ta ut 80 % alderspensjon. Prøv gjerne andre kombinasjoner.',
      },
      {
        variant: 'lavere grad og tidligere helt uttak i samme år',
        heltUttaksalder: { aar: 67, maaneder: 2 },
        gradertUttaksperiode: { grad: 80, uttaksalder: nedreAldersgrense },
        grad: 60,
        alertId: 'beregning.vilkaarsproeving.medAFP.gradertUttak',
        intro:
          'Opptjeningen din er ikke høy nok til ønsket uttak. Du må endre valgene dine.',
        forslag:
          'Et alternativ er at du ved 64 år og 2 måneder kan ta ut 60 % alderspensjon. Prøv gjerne andre kombinasjoner.',
      },
      {
        variant: 'lavere grad og én måned senere helt uttak',
        heltUttaksalder: { aar: 67, maaneder: 4 },
        gradertUttaksperiode: { grad: 80, uttaksalder: nedreAldersgrense },
        grad: 60,
        alertId: 'beregning.vilkaarsproeving.medAFP.heltOgGradertUttak',
        intro:
          'Opptjeningen din er ikke høy nok til ønsket uttak. Du må sette ned uttaksgraden.',
        forslag:
          'Et alternativ er at du ved 64 år og 2 måneder kan ta ut 60 % alderspensjon, hvis du tar ut 100 % alderspensjon ved 67 år og 4 måneder eller senere. Prøv gjerne andre kombinasjoner.',
      },
      {
        variant: 'mulig 20 % ved nedre alder og 100 % ved normert alder',
        heltUttaksalder: normertPensjoneringsalder,
        gradertUttaksperiode: { grad: 80, uttaksalder: nedreAldersgrense },
        grad: 20,
        alertId: 'beregning.vilkaarsproeving.medAFP.heltOgGradertUttak',
        intro:
          'Opptjeningen din er ikke høy nok til ønsket uttak. Du må sette ned uttaksgraden.',
        forslag:
          'Et alternativ er at du ved 64 år og 2 måneder kan ta ut 20 % alderspensjon, hvis du tar ut 100 % alderspensjon ved 68 år og 1 måned eller senere. Prøv gjerne andre kombinasjoner.',
      },
    ])(
      'viser Sanity-varsel og backendens aldersgrenser for $variant',
      ({
        heltUttaksalder,
        gradertUttaksperiode,
        grad,
        alertId,
        intro,
        forslag,
      }) => {
        render(
          <IntlProvider locale="nb" messages={nb}>
            <VilkaarsproevingAlert
              alternativ={{
                heltUttaksalder,
                gradertUttaksalder: nedreAldersgrense,
                uttaksgrad: grad,
              }}
              uttaksalder={uttaksalder}
              withAFP
            />
          </IntlProvider>,
          {
            preloadedState: {
              userInput: {
                ...userInputInitialState,
                currentSimulation: {
                  ...userInputInitialState.currentSimulation,
                  gradertUttaksperiode,
                },
              },
            },
            preloadedApiState: { getPerson: person },
          }
        )

        const alert = screen.getByTestId(alertId)
        expect(alert).toHaveTextContent(intro)
        expect(alert).toHaveTextContent(forslag)
        expect(screen.getAllByRole('alert')).toHaveLength(1)
      }
    )

    it.each([null, undefined])(
      'viser ny variant når backend ikke finner alternativ for 20 %% ved nedre alder og 100 %% ved normert alder (%s)',
      (alternativ) => {
        render(
          <IntlProvider locale="nb" messages={nb}>
            <VilkaarsproevingAlert
              alternativ={alternativ}
              uttaksalder={normertPensjoneringsalder}
              withAFP
            />
          </IntlProvider>,
          {
            preloadedState: {
              userInput: {
                ...userInputInitialState,
                currentSimulation: {
                  ...userInputInitialState.currentSimulation,
                  uttaksalder: normertPensjoneringsalder,
                  gradertUttaksperiode: {
                    grad: 20,
                    uttaksalder: nedreAldersgrense,
                  },
                },
              },
            },
            preloadedApiState: { getPerson: person },
          }
        )

        const alert = screen.getByTestId(
          'beregning.vilkaarsproeving.medAFP.ikkeNokOpptjening'
        )
        expect(alert).toHaveTextContent(
          'Opptjeningen din er ikke høy nok til uttak av alderspensjon ved 64 år og 2 måneder.'
        )
        expect(alert).toHaveTextContent(
          'Kalkulatoren kan ikke beregne uttak etter 64 år og 2 måneder. Hvis du tar ut alderspensjon og AFP senere enn dette, vil du i perioden fra du er 62 år frem til uttak ikke få uføretrygd. Kontakt Nav for veiledning hvis du vurderer å si fra deg uføretrygden.'
        )
        expect(alert).toHaveTextContent(
          'Har du rett til livsvarig AFP i offentlig sektor kan du ta ut AFP før alderspensjon. Kontakt tjenestepensjonsordningen din for veiledning.'
        )
        expect(screen.getAllByRole('alert')).toHaveLength(1)
      }
    )
  })
  describe('Gitt at brukeren har valgt å beregne AFP etterfulgt av alderspensjon', () => {
    const uttaksalder = { aar: 63, maaneder: 3 }
    const mockedState = {
      userInput: {
        ...userInputInitialState,
        afpUtregningValg: 'AFP_ETTERFULGT_AV_ALDERSPENSJON',
      },
    }

    it('Når brukerens vilkaar ikke er oppfylt', () => {
      render(
        <VilkaarsproevingAlert
          alternativ={undefined}
          uttaksalder={uttaksalder}
        />,
        {
          // @ts-ignore
          preloadedState: {
            ...mockedState,
          },
        }
      )

      expect(
        screen.getByText(
          'Med opplysninger vi har om deg, oppfyller du ikke vilkårene for AFP.',
          {
            exact: false,
          }
        )
      ).toBeInTheDocument()
    })
  })
})
