import { describe, it } from 'vitest'

import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen, userEvent, waitFor, within } from '@/test-utils'

import { UtenlandsoppholdListe } from '..'
import { UTENLANDSOPPHOLD_FORM_NAMES } from '../../UtenlandsoppholdSkjema/utils'

describe('UtenlandsoppholdListe', () => {
  const registrertePerioder = [
    {
      id: '0',
      landkode: 'DZA',
      arbeidetUtenlands: false,
      startdato: '01.04.1980',
      sluttdato: '31.12.2000',
    },
    {
      id: '1',
      landkode: 'BEL',
      arbeidetUtenlands: false,
      startdato: '01.04.2024',
    },
  ]
  describe('Gitt at listen ikke har redigeringsmuligheter', () => {
    it('Når ingen utenlandsperiode er registert, rendres slik den skal', async () => {
      render(<UtenlandsoppholdListe erVisningIGrunnlag />)

      expect(
        await screen.findByText('stegvisning.utenlandsopphold.oppholdene.title')
      ).toBeVisible()
      expect(
        screen.queryByText(
          'stegvisning.utenlandsopphold.oppholdene.description'
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(
          'stegvisning.utenlandsopphold.oppholdene.description.periode'
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(
          'stegvisning.utenlandsopphold.oppholdene.button.legg_til'
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(
          'stegvisning.utenlandsopphold.oppholdene.button.legg_til_nytt'
        )
      ).not.toBeInTheDocument()
    })

    it('Når utenlandsperioder er registert, rendres slik den skal', async () => {
      render(<UtenlandsoppholdListe erVisningIGrunnlag />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            utenlandsperioder: [...registrertePerioder],
          },
        },
      })

      expect(
        await screen.findByText('stegvisning.utenlandsopphold.oppholdene.title')
      ).toBeVisible()
      expect(
        screen.queryByText(
          'stegvisning.utenlandsopphold.oppholdene.description'
        )
      ).not.toBeInTheDocument()
      expect(
        screen.getAllByText(
          'stegvisning.utenlandsopphold.oppholdene.description.periode',
          { exact: false }
        )
      ).toHaveLength(2)
      expect(
        screen.queryByText(
          'stegvisning.utenlandsopphold.oppholdene.button.legg_til'
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(
          'stegvisning.utenlandsopphold.oppholdene.button.legg_til_nytt'
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(
          'stegvisning.utenlandsopphold.oppholdene.button.endre'
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(
          'stegvisning.utenlandsopphold.oppholdene.button.slette'
        )
      ).not.toBeInTheDocument()
    })
  })

  describe('Gitt at listen har redigeringsmuligheter', () => {
    it('Når ingen utenlandsperiode er registert, vises skjemaet for første opphold direkte', async () => {
      const onSkjemaOpenChangeMock = vi.fn()
      render(
        <UtenlandsoppholdListe onSkjemaOpenChange={onSkjemaOpenChangeMock} />
      )

      expect(
        screen.getByText('stegvisning.utenlandsopphold.oppholdene.title')
      ).toBeVisible()
      expect(
        screen.getByText('stegvisning.utenlandsopphold.oppholdene.description')
      ).toBeVisible()
      expect(screen.getByTestId(UTENLANDSOPPHOLD_FORM_NAMES.land)).toBeVisible()
      expect(
        screen.getByTestId('legg-til-utenlandsopphold-submit')
      ).toBeVisible()
      expect(
        screen.queryByTestId('legg-til-utenlandsopphold-avbryt')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(
          'stegvisning.utenlandsopphold.oppholdene.button.legg_til_nytt'
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('utenlandsperiode-liste')
      ).not.toBeInTheDocument()
      await waitFor(() => {
        expect(onSkjemaOpenChangeMock).toHaveBeenLastCalledWith(true)
      })
    })

    it('Når utenlandsperioder er registert, rendres listen med rediger- og slett-knapper', async () => {
      const onSkjemaOpenChangeMock = vi.fn()
      render(
        <UtenlandsoppholdListe onSkjemaOpenChange={onSkjemaOpenChangeMock} />,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
              utenlandsperioder: [...registrertePerioder],
            },
          },
        }
      )

      expect(
        screen.getByText('stegvisning.utenlandsopphold.oppholdene.title')
      ).toBeVisible()
      expect(
        screen.getByText('stegvisning.utenlandsopphold.oppholdene.description')
      ).toBeVisible()
      expect(screen.getByText('Belgia')).toBeVisible()
      expect(
        screen.getByText(
          '01.04.2024 stegvisning.utenlandsopphold.oppholdene.description.periode.varig_opphold'
        )
      ).toBeVisible()
      expect(screen.getByText('Algerie')).toBeVisible()
      expect(screen.getByText('01.04.1980–31.12.2000')).toBeVisible()
      expect(
        screen.getByText(
          'stegvisning.utenlandsopphold.oppholdene.button.legg_til_nytt'
        )
      ).toBeVisible()
      expect(
        screen.getAllByText(
          'stegvisning.utenlandsopphold.oppholdene.button.endre'
        )
      ).toHaveLength(2)
      expect(
        screen.getAllByText(
          'stegvisning.utenlandsopphold.oppholdene.button.slette'
        )
      ).toHaveLength(2)
      expect(
        screen.queryByTestId(UTENLANDSOPPHOLD_FORM_NAMES.land)
      ).not.toBeInTheDocument()
      expect(onSkjemaOpenChangeMock).toHaveBeenLastCalledWith(false)
    })

    it('Når oppholdet har jobbet, vises det i beskrivelsen av perioden', async () => {
      render(<UtenlandsoppholdListe />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            utenlandsperioder: [
              {
                id: '0',
                landkode: 'FIN',
                arbeidetUtenlands: true,
                startdato: '01.01.1970',
                sluttdato: '31.12.1990',
              },
              {
                id: '1',
                landkode: 'FRA',
                arbeidetUtenlands: true,
                startdato: '01.01.2030',
              },
            ],
          },
        },
      })

      expect(
        screen.getByText(
          '01.01.1970–31.12.1990 stegvisning.utenlandsopphold.oppholdene.periode.jobbet'
        )
      ).toBeVisible()
      expect(
        screen.getByText(
          '01.01.2030 stegvisning.utenlandsopphold.oppholdene.periode.varig_jobbet'
        )
      ).toBeVisible()
    })

    it('Når brukeren ønsker å legge til et nytt opphold, vises skjemaet på samme side og kan avbrytes', async () => {
      const user = userEvent.setup()
      render(<UtenlandsoppholdListe />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            utenlandsperioder: [{ ...registrertePerioder[0] }],
          },
        },
      })

      await user.click(
        screen.getByText(
          'stegvisning.utenlandsopphold.oppholdene.button.legg_til_nytt'
        )
      )

      expect(
        await screen.findByTestId(UTENLANDSOPPHOLD_FORM_NAMES.land)
      ).toBeVisible()
      expect(
        screen.queryByText(
          'stegvisning.utenlandsopphold.oppholdene.button.legg_til_nytt'
        )
      ).not.toBeInTheDocument()
      expect(
        within(screen.getByTestId('utenlandsperiode-liste')).getByText(
          'Algerie'
        )
      ).toBeVisible()

      await user.click(screen.getByTestId('legg-til-utenlandsopphold-avbryt'))

      expect(
        screen.queryByTestId(UTENLANDSOPPHOLD_FORM_NAMES.land)
      ).not.toBeInTheDocument()
      expect(
        screen.getByRole('button', {
          name: 'stegvisning.utenlandsopphold.oppholdene.button.legg_til_nytt',
        })
      ).toHaveFocus()
    })

    it('Når brukeren ønsker å endre et opphold, vises skjemaet i stedet for oppholdet med riktig forhåndsutfylte verdier', async () => {
      const user = userEvent.setup()
      render(<UtenlandsoppholdListe />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            utenlandsperioder: [...registrertePerioder],
          },
        },
      })

      await user.click(
        screen.getAllByText(
          'stegvisning.utenlandsopphold.oppholdene.button.endre'
        )[1]
      )

      expect(await screen.findByDisplayValue('DZA')).toHaveAttribute(
        'name',
        UTENLANDSOPPHOLD_FORM_NAMES.land
      )
      expect(
        screen.getByText(
          '01.04.2024 stegvisning.utenlandsopphold.oppholdene.description.periode.varig_opphold'
        )
      ).toBeVisible()
      expect(
        screen.getByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.button.oppdater'
        )
      ).toBeVisible()
      expect(
        screen.getAllByText(
          'stegvisning.utenlandsopphold.oppholdene.button.endre'
        )
      ).toHaveLength(1)

      await user.click(screen.getByTestId('legg-til-utenlandsopphold-avbryt'))

      expect(
        screen.queryByTestId(UTENLANDSOPPHOLD_FORM_NAMES.land)
      ).not.toBeInTheDocument()
      expect(
        screen.getAllByText(
          'stegvisning.utenlandsopphold.oppholdene.button.endre'
        )
      ).toHaveLength(2)
    })

    it('Når brukeren ønsker å slette et opphold, åpnes modalen og oppholdet slettes ved bekreftelse', async () => {
      const user = userEvent.setup()
      render(<UtenlandsoppholdListe />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            utenlandsperioder: [{ ...registrertePerioder[0] }],
          },
        },
      })

      await user.click(
        screen.getByText(
          'stegvisning.utenlandsopphold.oppholdene.button.slette'
        )
      )
      expect(
        await screen.findByText('utenlandsopphold.slette_modal.title')
      ).toBeVisible()
      await user.click(
        screen.getByText('utenlandsopphold.slette_modal.button.avbryt')
      )
      await user.click(
        screen.getByText(
          'stegvisning.utenlandsopphold.oppholdene.button.slette'
        )
      )
      await user.click(
        screen.getByText('utenlandsopphold.slette_modal.button.slett')
      )

      expect(
        screen.queryByTestId('utenlandsperiode-liste')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(
          'stegvisning.utenlandsopphold.oppholdene.button.endre'
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(
          'stegvisning.utenlandsopphold.oppholdene.button.slette'
        )
      ).not.toBeInTheDocument()
      expect(screen.getByTestId(UTENLANDSOPPHOLD_FORM_NAMES.land)).toBeVisible()
    })
  })

  it('Når utenlandsperioder er registert, vises de i riktig rekkefølgen', async () => {
    render(<UtenlandsoppholdListe erVisningIGrunnlag />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          utenlandsperioder: [
            ...registrertePerioder,
            {
              id: '2',
              landkode: 'FIN',
              arbeidetUtenlands: true,
              startdato: '01.01.1970',
              sluttdato: '31.12.1990',
            },
          ],
        },
      },
    })

    const utenlandsperiodeListe = screen.getByTestId('utenlandsperiode-liste')
    const titles = utenlandsperiodeListe.querySelectorAll('b')
    expect(titles[0]).toHaveTextContent('Belgia')
    expect(titles[1]).toHaveTextContent('Algerie')
    expect(titles[2]).toHaveTextContent('Finland')
  })

  it('Når validationError er oppgitt, vises den nederst', async () => {
    render(
      <UtenlandsoppholdListe
        erVisningIGrunnlag
        validationError="lorem ipsum"
      />,
      {}
    )
    expect(await screen.findByText('lorem ipsum')).toBeVisible()
  })
})
