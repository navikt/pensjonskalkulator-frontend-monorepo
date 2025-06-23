import { describe, it } from 'vitest'

import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen, userEvent } from '@/test-utils'

import { UtenlandsoppholdListe } from '..'
import { UTENLANDSOPPHOLD_FORM_NAMES } from '../../UtenlandsoppholdModal/utils'

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
      id: '0',
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
    it('Når ingen utenlandsperiode er registert, rendres slik den skal', async () => {
      render(<UtenlandsoppholdListe />)

      expect(
        screen.getByText('stegvisning.utenlandsopphold.oppholdene.title')
      ).toBeVisible()
      expect(
        screen.getByText('stegvisning.utenlandsopphold.oppholdene.description')
      ).toBeInTheDocument()
      expect(
        screen.queryByText(
          'stegvisning.utenlandsopphold.oppholdene.description.periode'
        )
      ).not.toBeInTheDocument()
      expect(
        screen.getByText(
          'stegvisning.utenlandsopphold.oppholdene.button.legg_til'
        )
      ).toBeVisible()
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

    it('Når utenlandsperioder er registert, rendres slik den skal', async () => {
      render(<UtenlandsoppholdListe />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            utenlandsperioder: [...registrertePerioder],
          },
        },
      })

      expect(
        screen.getByText('stegvisning.utenlandsopphold.oppholdene.title')
      ).toBeVisible()
      expect(
        screen.getByText('stegvisning.utenlandsopphold.oppholdene.description')
      ).toBeVisible()
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
    })

    it('Når brukeren ønsker å legge til et opphold, åpnes det modalen', async () => {
      const user = userEvent.setup()
      render(<UtenlandsoppholdListe />)

      await user.click(
        screen.getByText(
          'stegvisning.utenlandsopphold.oppholdene.button.legg_til'
        )
      )
      expect(
        await screen.findByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.title'
        )
      ).toBeVisible()
    })

    it('Når brukeren ønsker å endre et opphold, åpnes det modalen med riktig opphold', async () => {
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
        screen.getByText('stegvisning.utenlandsopphold.oppholdene.button.endre')
      )
      expect(
        await screen.findByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.title'
        )
      ).toBeVisible()
      expect(
        (
          await screen.findByTestId<HTMLSelectElement>(
            UTENLANDSOPPHOLD_FORM_NAMES.land
          )
        ).value
      ).toBe('DZA')
    })

    it('Når brukeren ønsker å slette et opphold, åpnes det modalen og oppholdet slettes ved bekreftelse', async () => {
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
        screen.queryByText(
          'stegvisning.utenlandsopphold.oppholdene.description.periode'
        )
      ).not.toBeInTheDocument()
      expect(
        screen.getByText(
          'stegvisning.utenlandsopphold.oppholdene.button.legg_til'
        )
      ).toBeVisible()
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

  it('Når utenlandsperioder er registert, vises de i riktig rekkefølgen', async () => {
    render(<UtenlandsoppholdListe erVisningIGrunnlag />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          utenlandsperioder: [
            ...registrertePerioder,
            {
              id: '0',
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
