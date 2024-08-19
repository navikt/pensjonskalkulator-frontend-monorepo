import React from 'react'

import { describe, it, vi } from 'vitest'

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
