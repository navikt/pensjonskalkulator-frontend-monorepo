import { describe, it, vi } from 'vitest'

import { ErrorStep } from '..'
import { screen, render, userEvent, swallowErrors } from '@/test-utils'

describe('stegvisning - ErrorStep', () => {
  const onPrimaryButtonClickMock = vi.fn()
  const onSecondaryButtonClickMock = vi.fn()
  const onCancelMock = vi.fn()

  it('rendrer slik den skal når isLoading er true', async () => {
    render(
      <ErrorStep
        isLoading
        onPrimaryButtonClick={onPrimaryButtonClickMock}
        onSecondaryButtonClick={onSecondaryButtonClickMock}
      />
    )
    expect(screen.getByTestId('loader')).toBeVisible()
    expect(screen.queryByText('error.global.title')).not.toBeInTheDocument()
  })

  it('viser riktig tekster som default', async () => {
    render(
      <ErrorStep
        onPrimaryButtonClick={onPrimaryButtonClickMock}
        onSecondaryButtonClick={onSecondaryButtonClickMock}
        onCancel={onCancelMock}
      />
    )
    expect(screen.getByText('error.global.title')).toBeInTheDocument()
    expect(screen.getByText('error.global.ingress')).toBeInTheDocument()
    expect(screen.getByText('error.global.button.primary')).toBeInTheDocument()
    expect(
      screen.getByText('error.global.button.secondary')
    ).toBeInTheDocument()
    expect(screen.getByText('error.global.button.tertiary')).toBeInTheDocument()
  })

  it('kaller onPrimaryButtonClick når brukeren klikker på primary knappen', async () => {
    const user = userEvent.setup()
    render(
      <ErrorStep
        isLoading={false}
        onPrimaryButtonClick={onPrimaryButtonClickMock}
        onSecondaryButtonClick={onSecondaryButtonClickMock}
      />
    )
    expect(screen.getByText('error.global.title')).toBeInTheDocument()
    expect(
      screen.queryByText('error.global.button.tertiary')
    ).not.toBeInTheDocument()
    await user.click(screen.getByText('error.global.button.primary'))
    expect(onPrimaryButtonClickMock).toHaveBeenCalled()
  })

  it('kaller onSecondaryButtonClick når brukeren klikker på secondary knappen', async () => {
    const user = userEvent.setup()
    render(
      <ErrorStep
        isLoading={false}
        onPrimaryButtonClick={onPrimaryButtonClickMock}
        onSecondaryButtonClick={onSecondaryButtonClickMock}
      />
    )
    expect(screen.getByText('error.global.title')).toBeInTheDocument()
    expect(
      screen.queryByText('error.global.button.tertiary')
    ).not.toBeInTheDocument()
    await user.click(screen.getByText('error.global.button.secondary'))
    expect(onSecondaryButtonClickMock).toHaveBeenCalled()
  })

  it('viser en Avbryt knapp, og kaller onCancel når det er oppgitt', async () => {
    const user = userEvent.setup()
    render(
      <ErrorStep
        isLoading={false}
        onPrimaryButtonClick={onPrimaryButtonClickMock}
        onSecondaryButtonClick={onSecondaryButtonClickMock}
        onCancel={onCancelMock}
      />
    )
    expect(screen.getByText('error.global.title')).toBeInTheDocument()
    expect(screen.getByText('error.global.button.tertiary')).toBeInTheDocument()
    await user.click(screen.getByText('error.global.button.tertiary'))
    expect(onCancelMock).toHaveBeenCalled()
  })

  it('viser custom tekster når de er oppgitt', async () => {
    swallowErrors(() => {
      const { asFragment } = render(
        <ErrorStep
          isLoading={false}
          onPrimaryButtonClick={onPrimaryButtonClickMock}
          onSecondaryButtonClick={onSecondaryButtonClickMock}
          onCancel={onCancelMock}
          text={{
            header: 'header',
            ingress: 'ingress',
            primaryButton: 'button_1',
            secondaryButton: 'button_2',
            tertiaryButton: 'button_3',
          }}
        />
      )
      expect(asFragment).toMatchSnapshot()
    })
  })
})
