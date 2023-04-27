import React, { ErrorInfo, ReactNode } from 'react'

import { Alert, Heading } from '@navikt/ds-react'

import { logError } from '@/api/logError'

import styles from './ErrorBoundary.module.scss'

function GlobalFeilmelding() {
  return (
    <div className={styles.wrapper}>
      <Alert variant="error">
        <Heading spacing size="small" level="1">
          Oisann!
        </Heading>
        Det har oppstått en feil. Prøv igjen senere.
      </Alert>
    </div>
  )
}

interface Props {
  fallback?: ReactNode
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError(error.message, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <GlobalFeilmelding />
    }

    return this.props.children
  }
}
