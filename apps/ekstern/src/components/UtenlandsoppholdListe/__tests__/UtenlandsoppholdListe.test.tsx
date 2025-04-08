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
      const utenlandsperiodeListe = screen.getByTestId('utenlandsperiode-liste')
      expect(utenlandsperiodeListe).toMatchInlineSnapshot(`
        <dl
          class="_utenlandsperioder_6a3650"
          data-testid="utenlandsperiode-liste"
        >
          <div
            class="_utenlandsperioderItem_6a3650"
          >
            <div
              class="_utenlandsperioderText_6a3650"
            >
              <dd>
                <b>
                  Belgia
                </b>
              </dd>
              <dd>
                stegvisning.utenlandsopphold.oppholdene.description.periode
                01.04.2024
                 stegvisning.utenlandsopphold.oppholdene.description.periode.varig_opphold
              </dd>
              <dd>
                stegvisning.utenlandsopphold.oppholdene.description.har_jobbet
                stegvisning.utenlandsopphold.oppholdene.description.har_jobbet.nei
              </dd>
            </div>
          </div>
          <div
            class="_utenlandsperioderItem_6a3650"
          >
            <div
              class="_utenlandsperioderText_6a3650"
            >
              <dd>
                <b>
                  Algerie
                </b>
              </dd>
              <dd>
                stegvisning.utenlandsopphold.oppholdene.description.periode
                01.04.1980
                –31.12.2000
              </dd>
            </div>
          </div>
        </dl>
      `)
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
      const utenlandsperiodeListe = screen.getByTestId('utenlandsperiode-liste')
      expect(utenlandsperiodeListe).toMatchInlineSnapshot(`
        <dl
          class="_utenlandsperioder_6a3650"
          data-testid="utenlandsperiode-liste"
        >
          <div
            class="_utenlandsperioderItem_6a3650"
          >
            <div
              class="_utenlandsperioderText_6a3650"
            >
              <dd>
                <b>
                  Belgia
                </b>
              </dd>
              <dd>
                stegvisning.utenlandsopphold.oppholdene.description.periode
                01.04.2024
                 stegvisning.utenlandsopphold.oppholdene.description.periode.varig_opphold
              </dd>
              <dd>
                stegvisning.utenlandsopphold.oppholdene.description.har_jobbet
                stegvisning.utenlandsopphold.oppholdene.description.har_jobbet.nei
              </dd>
            </div>
            <dd
              class="_utenlandsperioderButtons_6a3650"
            >
              <button
                class="_utenlandsperioderButtons__endre_6a3650 navds-button navds-button--tertiary navds-button--small"
                data-testid="endre-utenlandsopphold"
              >
                <span
                  class="navds-button__icon"
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    focusable="false"
                    height="1em"
                    role="img"
                    viewBox="0 0 24 24"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clip-rule="evenodd"
                      d="M19.638 4.417a3.25 3.25 0 0 0-4.608-.008l-9.378 9.379a.75.75 0 0 0-.191.324l-1.414 4.95a.75.75 0 0 0 .925.927l4.94-1.398a.75.75 0 0 0 .327-.191l9.39-9.391a3.25 3.25 0 0 0 .01-4.592M16.091 5.47a1.752 1.752 0 1 1 2.478 2.478l-.23.23-2.477-2.479zM14.8 6.76 6.85 14.71l-.991 3.47 3.457-.979 7.963-7.963z"
                      fill="currentColor"
                      fill-rule="evenodd"
                    />
                  </svg>
                </span>
                <span
                  class="navds-label navds-label--small"
                >
                  stegvisning.utenlandsopphold.oppholdene.button.endre
                </span>
              </button>
              <button
                class="_utenlandsperioderButtons__slette_6a3650 navds-button navds-button--tertiary navds-button--small"
                data-testid="slett-utenlandsopphold"
              >
                <span
                  class="navds-label navds-label--small"
                >
                  stegvisning.utenlandsopphold.oppholdene.button.slette
                </span>
              </button>
            </dd>
          </div>
          <div
            class="_utenlandsperioderItem_6a3650"
          >
            <div
              class="_utenlandsperioderText_6a3650"
            >
              <dd>
                <b>
                  Algerie
                </b>
              </dd>
              <dd>
                stegvisning.utenlandsopphold.oppholdene.description.periode
                01.04.1980
                –31.12.2000
              </dd>
            </div>
            <dd
              class="_utenlandsperioderButtons_6a3650"
            >
              <button
                class="_utenlandsperioderButtons__endre_6a3650 navds-button navds-button--tertiary navds-button--small"
                data-testid="endre-utenlandsopphold"
              >
                <span
                  class="navds-button__icon"
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    focusable="false"
                    height="1em"
                    role="img"
                    viewBox="0 0 24 24"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clip-rule="evenodd"
                      d="M19.638 4.417a3.25 3.25 0 0 0-4.608-.008l-9.378 9.379a.75.75 0 0 0-.191.324l-1.414 4.95a.75.75 0 0 0 .925.927l4.94-1.398a.75.75 0 0 0 .327-.191l9.39-9.391a3.25 3.25 0 0 0 .01-4.592M16.091 5.47a1.752 1.752 0 1 1 2.478 2.478l-.23.23-2.477-2.479zM14.8 6.76 6.85 14.71l-.991 3.47 3.457-.979 7.963-7.963z"
                      fill="currentColor"
                      fill-rule="evenodd"
                    />
                  </svg>
                </span>
                <span
                  class="navds-label navds-label--small"
                >
                  stegvisning.utenlandsopphold.oppholdene.button.endre
                </span>
              </button>
              <button
                class="_utenlandsperioderButtons__slette_6a3650 navds-button navds-button--tertiary navds-button--small"
                data-testid="slett-utenlandsopphold"
              >
                <span
                  class="navds-label navds-label--small"
                >
                  stegvisning.utenlandsopphold.oppholdene.button.slette
                </span>
              </button>
            </dd>
          </div>
        </dl>
      `)
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
          (await screen.findByTestId(
            UTENLANDSOPPHOLD_FORM_NAMES.land
          )) as HTMLSelectElement
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
    expect(utenlandsperiodeListe).toMatchInlineSnapshot(`
      <dl
        class="_utenlandsperioder_6a3650"
        data-testid="utenlandsperiode-liste"
      >
        <div
          class="_utenlandsperioderItem_6a3650"
        >
          <div
            class="_utenlandsperioderText_6a3650"
          >
            <dd>
              <b>
                Belgia
              </b>
            </dd>
            <dd>
              stegvisning.utenlandsopphold.oppholdene.description.periode
              01.04.2024
               stegvisning.utenlandsopphold.oppholdene.description.periode.varig_opphold
            </dd>
            <dd>
              stegvisning.utenlandsopphold.oppholdene.description.har_jobbet
              stegvisning.utenlandsopphold.oppholdene.description.har_jobbet.nei
            </dd>
          </div>
        </div>
        <div
          class="_utenlandsperioderItem_6a3650"
        >
          <div
            class="_utenlandsperioderText_6a3650"
          >
            <dd>
              <b>
                Algerie
              </b>
            </dd>
            <dd>
              stegvisning.utenlandsopphold.oppholdene.description.periode
              01.04.1980
              –31.12.2000
            </dd>
          </div>
        </div>
        <div
          class="_utenlandsperioderItem_6a3650"
        >
          <div
            class="_utenlandsperioderText_6a3650"
          >
            <dd>
              <b>
                Finland
              </b>
            </dd>
            <dd>
              stegvisning.utenlandsopphold.oppholdene.description.periode
              01.01.1970
              –31.12.1990
            </dd>
          </div>
        </div>
      </dl>
    `)
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
