export const getHost = (mode: string) =>
  mode === 'test' ? 'http://localhost:8088' : ''

export const PATH = `${import.meta.env.BASE_URL}api`

export const API_BASEURL = `${getHost(import.meta.env.MODE)}${PATH}`
