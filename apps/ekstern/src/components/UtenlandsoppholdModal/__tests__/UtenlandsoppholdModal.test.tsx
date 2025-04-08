import React from 'react'
import { describe, it } from 'vitest'

import {
  act,
  fireEvent,
  render,
  screen,
  userEvent,
  waitFor,
} from '@/test-utils'

import { UtenlandsoppholdModal } from '..'
import * as utenlandsoppholdModalUtils from '../utils'

describe('UtenlandsoppholdModal', () => {
  describe('Gitt at det skal registreres et nytt opphold', () => {
    it('rendrer slik den skal', async () => {
      const modalRef = React.createRef<HTMLDialogElement>()

      render(
        <UtenlandsoppholdModal modalRef={modalRef} onSubmitCallback={vi.fn()} />
      )
      modalRef.current?.showModal()
      expect(
        await screen.findByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.title'
        )
      ).toBeVisible()
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

    it('når brukeren klikker på legg til før noe er fylt ut, kaller onValidate, viser feilmeldinger og submitter ikke skjemaet', async () => {
      const onSubmitCallbackMock = vi.fn()

      const user = userEvent.setup()
      const modalRef = React.createRef<HTMLDialogElement>()
      render(
        <UtenlandsoppholdModal
          modalRef={modalRef}
          onSubmitCallback={onSubmitCallbackMock}
        />
      )
      modalRef.current?.showModal()

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
      const modalRef = React.createRef<HTMLDialogElement>()

      render(
        <UtenlandsoppholdModal modalRef={modalRef} onSubmitCallback={vi.fn()} />
      )
      modalRef.current?.showModal()

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

      fireEvent.change(
        await screen.findByTestId(
          utenlandsoppholdModalUtils.UTENLANDSOPPHOLD_FORM_NAMES.land
        ),
        {
          target: { value: 'AFG' },
        }
      )

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

      fireEvent.change(
        await screen.findByTestId(
          utenlandsoppholdModalUtils.UTENLANDSOPPHOLD_FORM_NAMES.land
        ),
        {
          target: { value: 'FRA' },
        }
      )

      expect(
        await screen.findByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.har_jobbet.description'
        )
      ).toBeVisible()
    })

    it('når brukeren klikker på legg til med bare land fylt ut, kaller onValidate, viser feilmeldinger og submitter ikke skjemaet', async () => {
      const onSubmitCallbackMock = vi.fn()

      const user = userEvent.setup()
      const modalRef = React.createRef<HTMLDialogElement>()
      render(
        <UtenlandsoppholdModal
          modalRef={modalRef}
          onSubmitCallback={onSubmitCallbackMock}
        />
      )
      modalRef.current?.showModal()

      await act(async () => {
        fireEvent.change(
          await screen.findByTestId(
            utenlandsoppholdModalUtils.UTENLANDSOPPHOLD_FORM_NAMES.land
          ),
          {
            target: { value: 'FRA' },
          }
        )
      })
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
      const modalRef = React.createRef<HTMLDialogElement>()

      render(
        <UtenlandsoppholdModal
          modalRef={modalRef}
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
      modalRef.current?.showModal()

      expect(
        await screen.findByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.title'
        )
      ).toBeVisible()
      expect(
        (
          (await screen.findByTestId(
            utenlandsoppholdModalUtils.UTENLANDSOPPHOLD_FORM_NAMES.land
          )) as HTMLSelectElement
        ).value
      ).toBe('FRA')
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
          (await screen.findByTestId(
            utenlandsoppholdModalUtils.UTENLANDSOPPHOLD_FORM_NAMES.startdato
          )) as HTMLSelectElement
        ).value
      ).toBe('20.01.2001')
      expect(
        await screen.findByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.sluttdato.label'
        )
      ).toBeVisible()
      expect(
        (
          (await screen.findByTestId(
            utenlandsoppholdModalUtils.UTENLANDSOPPHOLD_FORM_NAMES.sluttdato
          )) as HTMLSelectElement
        ).value
      ).toBe('20.01.2011')
      expect(
        await screen.findByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.button.oppdater'
        )
      ).toBeVisible()
      expect(
        await screen.findByText(
          'utenlandsopphold.om_oppholdet_ditt_modal.button.avbryt_endring'
        )
      ).toBeVisible()
    })

    it('når brukeren klikker på oppdater med en ugyldig sluttdato, kaller onValidate, viser feilmeldinger og submitter ikke skjemaet', async () => {
      const onSubmitCallbackMock = vi.fn()

      const user = userEvent.setup()
      const modalRef = React.createRef<HTMLDialogElement>()

      render(
        <UtenlandsoppholdModal
          modalRef={modalRef}
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

      modalRef.current?.showModal()

      const sluttdatoInput = await screen.findByTestId(
        utenlandsoppholdModalUtils.UTENLANDSOPPHOLD_FORM_NAMES.startdato
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
