import { SanityContext } from '@pensjonskalkulator-frontend-monorepo/sanity'
import { SanityAlert } from '@pensjonskalkulator-frontend-monorepo/sanity/SanityAlert'
import type { ContextType } from 'react'
import { describe, expect, it } from 'vitest'

import { render, screen } from '@/test-utils'

import { ApotekereWarning } from '..'

describe('ApotekereWarning', () => {
  it('renders the warning when showWarning is true', () => {
    render(<ApotekereWarning showWarning={true} />)

    const alert = screen.getByTestId('apoteker.beregning-med-afp-feil')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveAttribute('data-size', 'small')
    expect(alert.querySelector('.aksel-base-alert__header')).toBeInTheDocument()
    expect(
      alert.querySelector('.aksel-base-alert__message')
    ).not.toBeInTheDocument()
    expect(alert).toHaveTextContent(
      'Hvis du er medlem av Pensjonsordningen for apotekvirksomhet (POA) er beregning med AFP for øyeblikket feil. Prøv igjen senere.'
    )
  })

  it('returns null when showWarning is false', () => {
    const { container } = render(<ApotekereWarning showWarning={false} />)

    expect(
      screen.queryByTestId('apoteker.beregning-med-afp-feil')
    ).not.toBeInTheDocument()
    expect(container.firstChild).toBeNull()
  })

  it.each(['message', 'info'] as const)(
    'selects the %s InfoCard template from its status',
    (infoCardStatus) => {
      const alert = {
        name: 'test-headingless-info-card',
        type: 'info-card',
        status: 'info',
        infoCardStatus,
        overskrift: infoCardStatus === 'message' ? 'Unused heading' : null,
        buttonLabel: null,
        innhold: [
          {
            _key: 'message-block',
            _type: 'block',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _key: 'message-text',
                _type: 'span',
                marks: [],
                text: 'Kort infomelding',
              },
            ],
          },
        ],
      } as unknown as ContextType<typeof SanityContext>['alertData'][string]

      render(
        <SanityContext.Provider
          value={{
            alertData: { [alert.name]: alert },
            guidePanelData: {},
            readMoreData: {},
            forbeholdAvsnittData: [],
            isSanityLoading: false,
          }}
        >
          <SanityAlert id={alert.name} />
        </SanityContext.Provider>
      )

      const message = screen.getByTestId(alert.name)
      expect(message).toHaveAttribute('data-size', 'small')
      expect(message).toHaveTextContent('Kort infomelding')
      if (infoCardStatus === 'message') {
        expect(
          message.querySelector('.aksel-base-alert__message')
        ).toBeInTheDocument()
        expect(message).not.toHaveTextContent('Unused heading')
      } else {
        expect(
          message.querySelector('.aksel-base-alert__message')
        ).not.toBeInTheDocument()
        expect(
          message.querySelector('.aksel-base-alert__content')
        ).toBeInTheDocument()
      }
      expect(
        message.querySelector('.aksel-base-alert__header')
      ).not.toBeInTheDocument()
    }
  )

  it.each(['global-alert', 'local-alert', 'inline-message'] as const)(
    'renders %s in small size',
    (type) => {
      const alert = {
        name: 'test-small-alert',
        type,
        status: 'info' as const,
        infoCardStatus: null,
        overskrift: null,
        buttonLabel: null,
        innhold: [],
      }

      render(
        <SanityContext.Provider
          value={{
            alertData: { [alert.name]: alert },
            guidePanelData: {},
            readMoreData: {},
            forbeholdAvsnittData: [],
            isSanityLoading: false,
          }}
        >
          <SanityAlert id={alert.name} aria-live="polite" />
        </SanityContext.Provider>
      )

      expect(screen.getByTestId(alert.name)).toHaveAttribute(
        'data-size',
        'small'
      )
      expect(screen.getByTestId(alert.name)).toHaveAttribute(
        'aria-live',
        'polite'
      )
    }
  )
})
