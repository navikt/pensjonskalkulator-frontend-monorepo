export const addSelfDestructingEventListener = <T>(
  element: Window | Document | HTMLElement,
  eventType: string,
  callback: (e: Event, args?: T) => void,
  callbackArgs?: T
): ((e: Event) => void) => {
  const handler = (e: Event) => {
    callback(e, callbackArgs)
    element.removeEventListener(eventType, handler)
  }
  element.addEventListener(eventType, handler)
  return handler
}

export const cleanAndAddEventListener = <T>(
  element: Window | Document | HTMLElement,
  eventType: string,
  callback: (e: Event, args: T) => void,
  callbackArgs: T
) => {
  const handler = (e: Event) => {
    callback(e, callbackArgs)
  }
  element.removeEventListener(eventType, handler)
  element.addEventListener(eventType, handler)
}
