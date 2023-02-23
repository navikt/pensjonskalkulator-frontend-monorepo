import { useState, useEffect } from 'react'

import { Button } from '@navikt/ds-react'

import { onButtonClick } from './App-utils'
import reactLogo from './assets/react.svg'

import styles from './App.module.scss'

function App() {
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
    <div className="App">
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
            className={`${styles.logo} ${styles['logo--react']}`}
            alt="React logo"
          />
        </a>
      </div>
      <h1 className={styles.title}>Pensjonskalkulator is "{livenessStatus}"</h1>

      <div className={styles.card}>
        <Button
          className={styles.button}
          onClick={() => onButtonClick(count, setCount)}
        >
          count is {count}
        </Button>
        <p>Du bør muligens spare bittelitt mer altså...</p>
      </div>
    </div>
  )
}

export default App
