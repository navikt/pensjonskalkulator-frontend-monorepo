import { describe, it, vi } from 'vitest'

import { ErrorStep } from '..'
import { screen, render, userEvent } from '@/test-utils'

describe('stegvisning - ErrorStep', () => {
  const onCancelMock = vi.fn()
  const onReloadMock = vi.fn()

  it('rendrer slik den skal når isLoading er true', async () => {
    render(
      <ErrorStep isLoading onCancel={onCancelMock} onReload={onReloadMock} />
    )
    expect(screen.getByTestId('loader')).toBeVisible()
    expect(screen.queryByText('error.global.title')).not.toBeInTheDocument()
  })

  it('kaller onReload når brukeren klikker på Last siden på reload knappen', async () => {
    const user = userEvent.setup()
    render(
      <ErrorStep
        isLoading={false}
        onCancel={onCancelMock}
        onReload={onReloadMock}
      />
    )
    expect(screen.getByText('error.global.title')).toBeInTheDocument()
    await user.click(screen.getByText('error.global.button.reload'))
    expect(onReloadMock).toHaveBeenCalled()
  })

  it('kaller onCancel når brukeren klikker på Last siden på avbryt knappen', async () => {
    const user = userEvent.setup()
    render(
      <ErrorStep
        isLoading={false}
        onCancel={onCancelMock}
        onReload={onReloadMock}
      />
    )
    expect(screen.getByText('error.global.title')).toBeInTheDocument()
    await user.click(screen.getByText('error.global.button.avbryt'))
    expect(onCancelMock).toHaveBeenCalled()
  })
})
