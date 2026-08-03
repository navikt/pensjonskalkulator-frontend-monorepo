import { getAnalyticsInstance } from '@navikt/nav-dekoratoren-moduler'

import { isAnchorTag } from '@/state/api/typeguards'

type CustomEventProperties = Record<string, unknown>

// logger sender alt videre som frittstående (custom) events via analytics.custom.
const analytics = getAnalyticsInstance('dekoratoren')

export const logger = (eventName: string, eventData?: CustomEventProperties) =>
  analytics.custom(eventName, eventData)

export const wrapLogger =
  (name: string, properties?: CustomEventProperties) =>
  (func: () => void) =>
  () => {
    // TODO: fjern når amplitude er ikke i bruk lenger
    logger('button klikk', properties)
    logger(name, properties)
    return func()
  }

export const logOpenLink: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
  if (isAnchorTag(e.target)) {
    e.preventDefault()
    const { href, target } = e.target
    const windowTarget = target || '_self'

    logger('lenke klikket', { href, target: windowTarget })
    // TODO: fjern når amplitude er ikke i bruk lenger
    logger('link åpnet', { href, target: windowTarget })

    if (windowTarget === '_blank') {
      window.open(href, windowTarget, 'noopener,noreferrer')
    } else {
      window.open(href, windowTarget)
    }
  }
}
