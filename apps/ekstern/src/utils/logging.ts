import {
  type EventName,
  Events,
  type PropertiesFor,
  getAnalyticsInstance,
  isValidEventName,
} from '@navikt/nav-dekoratoren-moduler'

import { isAnchorTag } from '@/state/api/typeguards'

type CustomEventName =
  | 'accordion lukket' // TODO: fjern når amplitude er ikke i bruk lenger
  | 'accordion åpnet' // TODO: fjern når amplitude er ikke i bruk lenger
  | 'button klikk'
  | 'button click' // TODO: fjern når amplitude er ikke i bruk lenger
  | 'chip valgt'
  | 'expansion card lukket'
  | 'expansion card åpnet'
  | 'feilside'
  | 'graf tooltip åpnet'
  | 'grunnlag for beregningen'
  | 'help text lukket'
  | 'help text åpnet'
  | 'info'
  | 'link åpnet' // TODO: fjern når amplitude er ikke i bruk lenger
  | 'modal åpnet' // TODO: fjern når amplitude er ikke i bruk lenger
  | 'radiogroup valgt'
  | 'readmore lukket' // TODO: fjern når amplitude er ikke i bruk lenger
  | 'readmore åpnet' // TODO: fjern når amplitude er ikke i bruk lenger
  | 'resultat vist'
  | 'show more lukket'
  | 'show more åpnet'

type CustomEventProperties = Record<string, unknown>

export const logger = getAnalyticsInstance('dekoratoren')

const logEvent = <TName extends EventName>(
  eventName: TName,
  eventData?: PropertiesFor<TName>
) => logger(eventName, eventData)

const logCustomEvent = (
  eventName: CustomEventName,
  eventData?: CustomEventProperties
) => logger.custom(eventName, eventData)

export function wrapLogger<TName extends EventName>(
  name: TName,
  properties: PropertiesFor<TName>
): (func: () => void) => () => void
export function wrapLogger(
  name: CustomEventName,
  properties: CustomEventProperties
): (func: () => void) => () => void
export function wrapLogger(
  name: EventName | CustomEventName,
  properties: CustomEventProperties
) {
  return (func: () => void) => () => {
    logCustomEvent('button klikk', properties)

    if (isValidEventName(name)) {
      logEvent(name, properties as never)
    } else {
      logCustomEvent(name, properties)
    }

    return func()
  }
}

export const logOpenLink: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
  const anchor = isAnchorTag(e.currentTarget)
    ? e.currentTarget
    : isAnchorTag(e.target)
      ? e.target
      : undefined

  if (anchor) {
    e.preventDefault()

    const { href, target, textContent } = anchor

    logEvent(Events.LINK_KLIKKET, {
      href,
      tekst: textContent?.trim() || href,
      apnerINyttVindu: target === '_blank',
      erEkstern:
        new URL(href, window.location.href).origin !== window.location.origin,
    })
    logCustomEvent('link åpnet', { href, target })

    window.open(href, target)
  }
}
