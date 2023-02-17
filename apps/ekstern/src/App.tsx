import { useState } from 'react'

import { Button } from '@navikt/ds-react'

import { onButtonClick } from './App-utils'
import reactLogo from './assets/react.svg'

import styles from './App.module.scss'

function App() {
  const [count, setCount] = useState(0)

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
      <h1 className={styles.title}>Pensjonskalkulator</h1>
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
