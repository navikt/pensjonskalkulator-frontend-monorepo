import { useState, useEffect } from 'react'

import { Button, Heading } from '@navikt/ds-react'

import reactLogo from '../assets/react.svg'
import frameStyles from '../Frame/Frame.module.scss'

import { onButtonClick } from './App-utils'

import styles from './App.module.scss'

export function App() {
  const [count, setCount] = useState<number>(0)
  const [livenessStatus, setLivenessStatus] = useState<string>('')

  useEffect(() => {
    const apiPath = '/pensjon/kalkulator/api/status'
    fetch(apiPath, {
      method: 'GET',
    })
      .then((response) => {
        if (response.ok) {
          return response.json()
        }
        throw new Error('Something went wrong')
      })
      .then((data) => {
        setLivenessStatus(data.status)
      })
      .catch((error) => {
        // TODO add error loggingto a server?
        console.warn(error)
      })
  }, [])

  return (
    <div
      className={`${frameStyles.frame} ${frameStyles.frame_isFlex} ${frameStyles.frame_hasPadding}`}
    >
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img
            src="/pensjon/kalkulator/vite.svg"
            className={styles.logo}
            alt="Vite logo"
          />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img
            src={reactLogo}
            className={`${styles.logo} ${styles.logo_react}`}
            alt="React logo"
          />
        </a>
      </div>
      <Heading spacing size="large" level="1">
        Pensjonskalkulator is "{livenessStatus}"
      </Heading>

      <div className={styles.card}>
        <Button
          className={styles.button}
          onClick={() => onButtonClick(count, setCount)}
        >
          count is {count}
        </Button>
        <p>{'Du bør muligens spare bittelitt mer altså...'}</p>
      </div>
    </div>
  )
}
