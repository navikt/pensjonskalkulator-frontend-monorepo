export const getHost = (mode: string) =>
  mode === 'test' ? 'http://localhost:8088' : ''

// import.meta.env.BASE_URL defineres av base i vite.config.js = /pensjon/kalkulator
export const API_PATH = import.meta.env
  ? `${import.meta.env.BASE_URL}/api`
  : '/pensjon/kalkulator/api'

export const HOST_BASEURL = `${getHost(import.meta.env?.MODE)}${
  import.meta.env?.BASE_URL
}`

export const API_BASEURL = `${getHost(import.meta.env?.MODE)}${API_PATH}`
