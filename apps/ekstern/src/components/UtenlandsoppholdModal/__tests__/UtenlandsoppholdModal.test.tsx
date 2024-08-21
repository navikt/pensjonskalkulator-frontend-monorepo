import React from 'react'

import { describe, it } from 'vitest'

import { UtenlandsoppholdModal } from '..'
import { screen, render } from '@/test-utils'

describe('UtenlandsoppholdModal', () => {
  it('rendrer slik den skal når det skal registreres et nytt opphold', async () => {
    const modalRef = React.createRef<HTMLDialogElement>()

    render(
      <UtenlandsoppholdModal modalRef={modalRef} onSubmitCallback={vi.fn()} />
    )
    modalRef.current?.showModal()

    expect(
      await screen.findByText('utenlandsopphold.om_oppholdet_ditt_modal.title')
    ).toBeVisible()
  })
})

// await user.click(
//   await screen.findByText(
//     'stegvisning.utenlandsopphold.oppholdene.button.legg_til'
//   )
// )

// const modal = await screen.findByRole('dialog')
// expect(modal).toBeVisible()

// fireEvent.change(
//   await screen.findByTestId(UTENLANDSOPPHOLD_FORM_NAMES.land),
//   {
//     target: { value: 'AFG' },
//   }
// )

// userEvent.selectOptions(
//   await screen.findByTestId(UTENLANDSOPPHOLD_FORM_NAMES.land),
//   'AFG'
// )

// await waitFor(async () => {
//   expect(
//     await screen.findByText('stegvisning.utenlandsopphold.radio_label')
//   ).toBeVisible()
// })

// fireEvent.change(
//   await screen.findByTestId(UTENLANDSOPPHOLD_FORM_NAMES.land),
//   {
//     target: { value: 'AFG' },
//   }
// )
// let options = getAllByTestId('select-option')
// expect(options[0].selected).toBeFalsy();
// expect(options[1].selected).toBeTruthy();
// await waitFor(async () => {
//   expect(await screen.findAllByRole('radio')).toBeVisible()
// const radioButtons = await screen.findAllByRole('radio')
// fireEvent.change(radioButtons[0], { target: { value: 'ja' } })
//   // await user.click(radioButtons[0])
// })

// expect(
//   await screen.findByTestId(UTENLANDSOPPHOLD_FORM_NAMES.startdato)
// ).toBeVisible()

// const buttons = await screen.findAllByRole('button')
// console.log('buttons', buttons)

// expect(asFragment()).toMatchSnapshot()
// const input = screen.getByRole('input')
// console.log('input', input)
// await user.clear(input)
// await user.type(input, '1')
// await user.type(input, '2')
// await user.type(input, '.')
// await user.type(input, '0')
// await user.type(input, '1')
// await user.type(input, '.')
// await user.type(input, '2')
// await user.type(input, '0')
// await user.type(input, '1')
// await user.type(input, '0')

// await user.click(
//   screen.getByText(
//     'utenlandsopphold.om_oppholdet_ditt_modal.button.legg_til'
//   )
// )

// expect(
//   screen.queryByText(
//     'stegvisning.utenlandsopphold.mangler_opphold.validation_error'
//   )
// ).not.toBeInTheDocument()
// await user.click(screen.getByText('stegvisning.neste'))
// expect(onNextMock).toHaveBeenCalled()
