import React, { Component, ReactNode } from 'react'

import { Alert, Heading } from '@navikt/ds-react'
import clsx from 'clsx'

import frameStyles from '../Frame/Frame.module.scss'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidCatch() {
    // TODO legge til error logging
    this.setState({ hasError: true })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={clsx(frameStyles.frame, frameStyles.frame_hasPadding)}>
          <Alert variant="error">
            <Heading spacing size="small" level="1">
              Oisann!
            </Heading>
            Det har oppstått en feil. Prøv igjen senere.
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}
