import { describe, it, vi } from 'vitest'

import { CardContent } from '../CardContent'
import { screen, render, userEvent, swallowErrors } from '@/test-utils'

describe('CardContent', () => {
  const onPrimaryButtonClickMock = vi.fn()
  const onSecondaryButtonClickMock = vi.fn()
  const onCancelMock = vi.fn()

  const textIds = {
    loading: 'loading',
    header: 'header',
    ingress: 'ingress',
    primaryButton: 'button_1',
    secondaryButton: 'button_2',
    tertiaryButton: 'button_3',
  }

  it('viser riktig tekster', async () => {
    swallowErrors(() => {
      render(
        <CardContent
          isLoading={false}
          onPrimaryButtonClick={onPrimaryButtonClickMock}
          onSecondaryButtonClick={onSecondaryButtonClickMock}
          onCancel={onCancelMock}
          text={{ ...textIds }}
        />
      )
      expect(screen.getByText(textIds.header)).toBeInTheDocument()
      expect(screen.getByText(textIds.ingress)).toBeInTheDocument()
      expect(screen.getByText(textIds.primaryButton)).toBeInTheDocument()
      expect(screen.getByText(textIds.secondaryButton)).toBeInTheDocument()
    })
  })

  it('rendrer slik den skal når isLoading er true', async () => {
    swallowErrors(() => {
      render(
        <CardContent
          isLoading
          onPrimaryButtonClick={onPrimaryButtonClickMock}
          onSecondaryButtonClick={onSecondaryButtonClickMock}
          text={{ ...textIds }}
        />
      )
      expect(screen.getByTestId('loader')).toBeVisible()
      expect(screen.queryByText(textIds.header)).not.toBeInTheDocument()
    })
  })

  it('kaller onPrimaryButtonClick når brukeren klikker på primary knappen', async () => {
    const user = userEvent.setup()
    swallowErrors(() => {
      render(
        <CardContent
          isLoading={false}
          onPrimaryButtonClick={onPrimaryButtonClickMock}
          onSecondaryButtonClick={onSecondaryButtonClickMock}
          text={{ ...textIds }}
        />
      )
    })
    expect(screen.getByText(textIds.header)).toBeInTheDocument()
    expect(screen.queryByText(textIds.tertiaryButton)).not.toBeInTheDocument()
    await user.click(screen.getByText(textIds.primaryButton))
    expect(onPrimaryButtonClickMock).toHaveBeenCalled()
  })

  it('kaller onSecondaryButtonClick når brukeren klikker på secondary knappen', async () => {
    const user = userEvent.setup()
    swallowErrors(() => {
      render(
        <CardContent
          isLoading={false}
          onPrimaryButtonClick={onPrimaryButtonClickMock}
          onSecondaryButtonClick={onSecondaryButtonClickMock}
          text={{ ...textIds }}
        />
      )
    })
    expect(screen.getByText(textIds.header)).toBeInTheDocument()
    expect(screen.queryByText(textIds.tertiaryButton)).not.toBeInTheDocument()
    await user.click(screen.getByText(textIds.secondaryButton))
    expect(onSecondaryButtonClickMock).toHaveBeenCalled()
  })

  it('viser en Avbryt knapp, og kaller onCancel når det er oppgitt', async () => {
    const user = userEvent.setup()
    swallowErrors(() => {
      render(
        <CardContent
          isLoading={false}
          onPrimaryButtonClick={onPrimaryButtonClickMock}
          onSecondaryButtonClick={onSecondaryButtonClickMock}
          onCancel={onCancelMock}
          text={{ ...textIds }}
        />
      )
    })
    expect(screen.getByText(textIds.header)).toBeInTheDocument()
    expect(screen.getByText(textIds.tertiaryButton)).toBeInTheDocument()
    await user.click(screen.getByText(textIds.tertiaryButton))
    expect(onCancelMock).toHaveBeenCalled()
  })
})
