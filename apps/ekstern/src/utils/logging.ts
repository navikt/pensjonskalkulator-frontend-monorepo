import { getAmplitudeInstance } from '@navikt/nav-dekoratoren-moduler'

const logger = getAmplitudeInstance('dekoratoren')

export const wrapLogger = (func: () => void) => {
  func()
  return logger
}

export default logger
