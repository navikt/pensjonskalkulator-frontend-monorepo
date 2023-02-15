import { useState } from 'react'

import { Button } from '@navikt/ds-react'

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
          onClick={() => setCount((c) => c + 1)}
        >
          count is {count}
        </Button>
        <p>Lorem ipsum dolor sit amet</p>
      </div>
    </div>
  )
}

export default App
