import { describe, it } from 'vitest'

import { act, render, screen, userEvent, waitFor } from '@/test-utils'

import { UtenlandsoppholdSkjema } from '..'
import * as utenlandsoppholdSkjemaUtils from '../utils'

const velgLand = async (
  user: ReturnType<typeof userEvent.setup>,
  landnavn: string
) => {
  await user.click(
    await screen.findByTestId(
      utenlandsoppholdSkjemaUtils.UTENLANDSOPPHOLD_FORM_NAMES.land
    )
  )
  await user.click(await screen.findByRole('option', { name: landnavn }))
}

describe('UtenlandsoppholdSkjema', () => {
  describe('Gitt at det skal registreres et nytt opphold', () => {
    it('rendrer slik den skal', async () => {
      render(<UtenlandsoppholdSkjema onSubmitCallback={vi.fn()} />)
      expect(
        await screen.findByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.button.legg_til'
        )
      ).toBeVisible()
      expect(
        await screen.findByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.button.avbryt'
        )
      ).toBeVisible()
    })

    it('skjuler avbryt-knappen når showCancelButton er false', async () => {
      render(
        <UtenlandsoppholdSkjema
          showCancelButton={false}
          onSubmitCallback={vi.fn()}
        />
      )

      expect(
        await screen.findByTestId('legg-til-utenlandsopphold-submit')
      ).toBeVisible()
      expect(
        screen.queryByTestId('legg-til-utenlandsopphold-avbryt')
      ).not.toBeInTheDocument()
    })

    it('når brukeren klikker på avbryt, kalles onSubmitCallback', async () => {
      const onSubmitCallbackMock = vi.fn()
      const user = userEvent.setup()
      render(<UtenlandsoppholdSkjema onSubmitCallback={onSubmitCallbackMock} />)

      await user.click(
        await screen.findByTestId('legg-til-utenlandsopphold-avbryt')
      )

      expect(onSubmitCallbackMock).toHaveBeenCalledTimes(1)
    })

    it('når brukeren klikker på legg til før noe er fylt ut, kaller onValidate, viser feilmeldinger og submitter ikke skjemaet', async () => {
      const onSubmitCallbackMock = vi.fn()

      const user = userEvent.setup()
      render(<UtenlandsoppholdSkjema onSubmitCallback={onSubmitCallbackMock} />)

      await act(async () => {
        await user.click(
          screen.getByText(
            'utenlandsopphold.om_oppholdet_ditt_modal.button.legg_til'
          )
        )
      })

      expect(
        screen.getByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.land.validation_error'
        )
      ).toBeVisible()

      expect(onSubmitCallbackMock).not.toHaveBeenCalled()
    })

    it('viser resten av skjemaet kun etter at land er valgt, og viser radio om jobbopphold kun når landet har krav om arbeid', async () => {
      const user = userEvent.setup()

      render(<UtenlandsoppholdSkjema onSubmitCallback={vi.fn()} />)

      expect(
        screen.queryByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.description'
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.startdato.description'
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.sluttdato.label'
        )
      ).not.toBeInTheDocument()

      await velgLand(user, 'Afghanistan')

      expect(
        screen.queryByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.description'
        )
      ).not.toBeInTheDocument()

      expect(
        await screen.findByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.startdato.description'
        )
      ).toBeVisible()
      expect(
        await screen.findByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.sluttdato.label'
        )
      ).toBeVisible()

      await velgLand(user, 'Frankrike')

      expect(
        await screen.findByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.description'
        )
      ).toBeVisible()
    })

    it('når brukeren klikker på legg til med bare land fylt ut, kaller onValidate, viser feilmeldinger og submitter ikke skjemaet', async () => {
      const onSubmitCallbackMock = vi.fn()

      const user = userEvent.setup()
      render(<UtenlandsoppholdSkjema onSubmitCallback={onSubmitCallbackMock} />)

      await velgLand(user, 'Frankrike')
      await waitFor(() => {
        expect(
          screen.getByText(
            'utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.description'
          )
        ).toBeVisible()
      })

      await act(async () => {
        await user.click(
          screen.getByText(
            'utenlandsopphold.om_oppholdet_ditt_modal.button.legg_til'
          )
        )
      })

      expect(
        screen.getByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.description'
        )
      ).toBeVisible()

      expect(
        screen.getByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.arbeidet_utenlands.validation_error'
        )
      ).toBeVisible()
      expect(
        screen.getByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.startdato.validation_error.required'
        )
      ).toBeVisible()

      expect(onSubmitCallbackMock).not.toHaveBeenCalled()
    })
  })

  describe('Gitt at det skal endres et eksisterende opphold', () => {
    it('rendrer slik den skal med riktig forhåndsfylte verdier', async () => {
      render(
        <UtenlandsoppholdSkjema
          onSubmitCallback={vi.fn()}
          utenlandsperiode={{
            id: '1',
            landkode: 'FRA',
            arbeidetUtenlands: true,
            startdato: '20.01.2001',
            sluttdato: '20.01.2011',
          }}
        />
      )

      expect(screen.getByDisplayValue('FRA')).toHaveAttribute(
        'name',
        utenlandsoppholdSkjemaUtils.UTENLANDSOPPHOLD_FORM_NAMES.land
      )
      expect(
        await screen.findByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.description'
        )
      ).toBeVisible()
      const radioButtons = await screen.findAllByRole('radio')
      expect(radioButtons).toHaveLength(2)
      expect(radioButtons[0]).toBeChecked()
      expect(radioButtons[1]).not.toBeChecked()
      expect(
        await screen.findByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.startdato.description'
        )
      ).toBeVisible()
      expect(
        (
          await screen.findByTestId<HTMLSelectElement>(
            utenlandsoppholdSkjemaUtils.UTENLANDSOPPHOLD_FORM_NAMES.startdato
          )
        ).value
      ).toBe('20.01.2001')
      expect(
        await screen.findByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.sluttdato.label'
        )
      ).toBeVisible()
      expect(
        (
          await screen.findByTestId<HTMLSelectElement>(
            utenlandsoppholdSkjemaUtils.UTENLANDSOPPHOLD_FORM_NAMES.sluttdato
          )
        ).value
      ).toBe('20.01.2011')
      expect(
        await screen.findByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.button.oppdater'
        )
      ).toBeVisible()
      expect(
        await screen.findByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.button.avbryt'
        )
      ).toBeVisible()
    })

    it('når brukeren klikker på oppdater med en ugyldig sluttdato, kaller onValidate, viser feilmeldinger og submitter ikke skjemaet', async () => {
      const onSubmitCallbackMock = vi.fn()

      const user = userEvent.setup()

      render(
        <UtenlandsoppholdSkjema
          onSubmitCallback={onSubmitCallbackMock}
          utenlandsperiode={{
            id: '1',
            landkode: 'FRA',
            arbeidetUtenlands: false,
            startdato: '20.01.2001',
            sluttdato: '20.01.2011',
          }}
        />
      )

      const sluttdatoInput = await screen.findByTestId(
        utenlandsoppholdSkjemaUtils.UTENLANDSOPPHOLD_FORM_NAMES.startdato
      )
      await act(async () => {
        await user.clear(sluttdatoInput)
        await user.type(sluttdatoInput, 'a')
      })

      await act(async () => {
        await user.click(
          screen.getByText(
            'utenlandsopphold.om_oppholdet_ditt_modal.button.oppdater'
          )
        )
      })

      expect(
        screen.getByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.dato.validation_error.format'
        )
      ).toBeVisible()

      expect(onSubmitCallbackMock).not.toHaveBeenCalled()
    })
  })
})
