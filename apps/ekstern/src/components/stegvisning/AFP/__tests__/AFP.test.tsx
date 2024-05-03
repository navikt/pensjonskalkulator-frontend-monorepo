import { describe, it, vi } from 'vitest'

import { AFP } from '..'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { apiSlice } from '@/state/api/apiSlice'
import { RootState } from '@/state/store'
import { screen, render, waitFor, userEvent } from '@/test-utils'

describe('stegvisning - AFP', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()

  it('rendrer slik den skal når afp ikke er oppgitt', async () => {
    const user = userEvent.setup()
    const result = render(
      <AFP
        afp={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.afp.title'
    )

    await user.click(screen.getByText('stegvisning.afp.readmore_privat_title'))
    await user.click(
      screen.getByText('stegvisning.afp.readmore_offentlig_title')
    )

    expect(result.asFragment()).toMatchSnapshot()
    expect(
      screen.getByRole('link', {
        name: 'AFP i privat sektor på afp.no application.global.external_link',
      })
    ).toHaveAttribute('href', 'https://www.afp.no')

    const radioButtons = await screen.findAllByRole('radio')
    await waitFor(() => {
      expect(radioButtons).toHaveLength(4)
      expect(radioButtons[0]).not.toBeChecked()
      expect(radioButtons[1]).not.toBeChecked()
      expect(radioButtons[2]).not.toBeChecked()
      expect(radioButtons[3]).not.toBeChecked()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('rendrer slik den skal når afp er oppgitt', async () => {
    const result = render(
      <AFP
        afp="nei"
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.afp.title'
    )
    const radioButtons = screen.getAllByRole('radio')
    await waitFor(() => {
      expect(radioButtons).toHaveLength(4)
      expect(radioButtons[0]).not.toBeChecked()
      expect(radioButtons[1]).not.toBeChecked()
      expect(radioButtons[2]).toBeChecked()
      expect(radioButtons[3]).not.toBeChecked()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('viser riktig infomeldinger når brukeren klikker på de ulike valgene', async () => {
    mockErrorResponse('/feature/pensjonskalkulator.enable-afp-offentlig')
    const user = userEvent.setup()
    render(
      <AFP
        afp={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.afp.title'
    )
    const radioButtons = screen.getAllByRole('radio')
    expect(
      screen.queryByText('stegvisning.afp.alert_ja_offentlig')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('stegvisning.afp.alert_vet_ikke')
    ).not.toBeInTheDocument()

    await user.click(radioButtons[0])

    expect(
      screen.getByText('stegvisning.afp.alert_ja_offentlig')
    ).toBeInTheDocument()
    expect(
      screen.queryByText('stegvisning.afp.alert_vet_ikke')
    ).not.toBeInTheDocument()

    await user.click(radioButtons[1])

    expect(
      screen.queryByText('stegvisning.afp.alert_ja_offentlig')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('stegvisning.afp.alert_vet_ikke')
    ).not.toBeInTheDocument()

    await user.click(radioButtons[2])

    expect(
      screen.queryByText('stegvisning.afp.alert_ja_offentlig')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('stegvisning.afp.alert_vet_ikke')
    ).not.toBeInTheDocument()

    await user.click(radioButtons[3])

    expect(
      screen.queryByText('stegvisning.afp.alert_ja_offentlig')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('stegvisning.afp.alert_vet_ikke')
    ).toBeInTheDocument()
  })

  it('validerer, viser feilmelding, fjerner feilmelding og kaller onNext når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    render(
      <AFP
        afp={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    const radioButtons = screen.getAllByRole('radio')

    await user.click(screen.getByText('stegvisning.neste'))

    waitFor(() => {
      expect(
        screen.getByText('stegvisning.afp.validation_error')
      ).toBeInTheDocument()
      expect(onNextMock).not.toHaveBeenCalled()
    })

    await user.click(radioButtons[0])

    expect(
      screen.queryByText('stegvisning.afp.validation_error')
    ).not.toBeInTheDocument()

    await user.click(screen.getByText('stegvisning.neste'))

    waitFor(() => {
      expect(onNextMock).toHaveBeenCalled()
    })
  })

  it('viser riktig tekst på Neste knapp når brukeren ikke har samboer', async () => {
    const { store } = render(
      <AFP
        afp={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    await store.dispatch(apiSlice.endpoints.getPerson.initiate())
    expect(await screen.findByText('stegvisning.neste')).toBeVisible()
    expect(screen.queryByText('stegvisning.beregn')).not.toBeInTheDocument()
  })

  it('viser riktig tekst på Neste knapp når brukeren har samboer', async () => {
    mockResponse('/v1/person', {
      status: 200,
      json: {
        fornavn: 'Ola',
        sivilstand: 'GIFT',
        foedselsdato: '1963-04-30',
      },
    })

    const { store } = render(
      <AFP
        afp={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    await store.dispatch(apiSlice.endpoints.getPerson.initiate())
    expect(await screen.findByText('stegvisning.beregn')).toBeVisible()
    expect(screen.queryByText('stegvisning.neste')).not.toBeInTheDocument()
  })

  it('viser riktig tekst på Neste knapp når brukeren har samboer, uføretrygd og at hen klikker på de ulike afp valgene', async () => {
    const user = userEvent.setup()

    mockResponse('/v1/person', {
      status: 200,
      json: {
        fornavn: 'Ola',
        sivilstand: 'GIFT',
        foedselsdato: '1963-04-30',
      },
    })

    mockResponse('/v1/ekskludert', {
      status: 200,
      json: {
        ekskludert: true,
        aarsak: 'HAR_LOEPENDE_UFOERETRYGD',
      },
    })

    const { store } = render(
      <AFP
        afp={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    await store.dispatch(apiSlice.endpoints.getEkskludertStatus.initiate())
    await store.dispatch(apiSlice.endpoints.getPerson.initiate())

    expect(await screen.findByText('stegvisning.neste')).toBeVisible()
    expect(screen.queryByText('stegvisning.beregn')).not.toBeInTheDocument()

    const radioButtons = screen.getAllByRole('radio')

    await user.click(radioButtons[0])
    expect(await screen.findByText('stegvisning.neste')).toBeVisible()
    expect(screen.queryByText('stegvisning.beregn')).not.toBeInTheDocument()

    await user.click(radioButtons[1])
    expect(await screen.findByText('stegvisning.neste')).toBeVisible()
    expect(screen.queryByText('stegvisning.beregn')).not.toBeInTheDocument()

    await user.click(radioButtons[2])
    expect(await screen.findByText('stegvisning.beregn')).toBeVisible()
    expect(screen.queryByText('stegvisning.neste')).not.toBeInTheDocument()

    await user.click(radioButtons[3])
    expect(await screen.findByText('stegvisning.neste')).toBeVisible()
    expect(screen.queryByText('stegvisning.beregn')).not.toBeInTheDocument()
  })

  it('kaller onNext når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    render(
      <AFP
        afp={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    const radioButtons = screen.getAllByRole('radio')

    await user.click(radioButtons[0])
    await user.click(screen.getByText('stegvisning.neste'))

    waitFor(() => {
      expect(onNextMock).toHaveBeenCalled()
    })
  })

  it('kaller onPrevious når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    render(
      <AFP
        afp="ja_privat"
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />,
      {
        preloadedState: { userInput: { samtykke: true } } as RootState,
      }
    )

    await user.click(screen.getByText('stegvisning.tilbake'))

    expect(onPreviousMock).toHaveBeenCalled()
  })

  it('kaller onCancel når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    render(
      <AFP
        afp="ja_privat"
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )

    await user.click(screen.getByText('stegvisning.avbryt'))

    expect(onCancelMock).toHaveBeenCalled()
  })
})
