import { describe, it, vi } from 'vitest'

import { Ufoere } from '..'
import { mockResponse } from '@/mocks/server'
import { apiSlice } from '@/state/api/apiSlice'
import { RootState } from '@/state/store'
import { screen, render, waitFor, userEvent } from '@/test-utils'
describe('stegvisning - Ufoere', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()

  it('rendrer slik den skal', async () => {
    const user = userEvent.setup()
    const result = render(
      <Ufoere
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.ufoere.title'
    )

    expect(await screen.findByText('stegvisning.ufoere.info')).toBeVisible()

    await user.click(screen.getByText('stegvisning.ufoere.readmore_1.title'))
    expect(
      await screen.findByText(
        'For å ha rett til AFP, kan du ikke ha fått utbetalt uføretrygd',
        { exact: false }
      )
    ).toBeVisible()
    await user.click(screen.getByText('stegvisning.ufoere.readmore_2.title'))
    expect(
      await screen.findByText('Hvis du jobber i privat sektor,', {
        exact: false,
      })
    ).toBeVisible()
    expect(await screen.findByText('stegvisning.ufoere.ingress')).toBeVisible()
    expect(result.asFragment()).toMatchSnapshot()
  })

  it('viser riktig tekst på Neste knapp når brukeren har samboer', async () => {
    mockResponse('/v1/person', {
      status: 200,
      json: {
        fornavn: 'Aprikos',
        sivilstand: 'GIFT',
        foedselsdato: '1963-04-30',
      },
    })

    const { store } = render(
      <Ufoere
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    await store.dispatch(apiSlice.endpoints.getPerson.initiate())
    expect(await screen.findByText('stegvisning.beregn')).toBeInTheDocument()
    expect(screen.queryByText('stegvisning.neste')).not.toBeInTheDocument()
  })

  it('kaller onNext når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    render(
      <Ufoere
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    await user.click(screen.getByText('stegvisning.neste'))

    waitFor(() => {
      expect(onNextMock).toHaveBeenCalled()
    })
  })

  it('kaller onPrevious når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    render(
      <Ufoere
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />,
      {
        preloadedState: {
          userInput: { samtykke: true, afp: 'ja_privat' },
        } as RootState,
      }
    )

    await user.click(screen.getByText('stegvisning.tilbake'))
    expect(onPreviousMock).toHaveBeenCalled()
  })

  it('kaller onCancel når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    render(
      <Ufoere
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )

    await user.click(screen.getByText('stegvisning.avbryt'))
    expect(onCancelMock).toHaveBeenCalled()
  })
})
