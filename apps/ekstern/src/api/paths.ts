const HOST = import.meta.env.MODE === 'test' ? 'http://localhost:8088' : ''

export const PATH = `${import.meta.env.BASE_URL}api`

export const API_BASEURL = `${HOST}${PATH}`
