export const addSelfDestructingEventListener = <T>(
  element: Document | HTMLElement,
  eventType: string,
  callback: (e: Event, args: T) => void,
  callbackArgs: T
) => {
  const handler = (e: Event) => {
    callback(e, callbackArgs)
    element.removeEventListener(eventType, handler)
  }
  element.addEventListener(eventType, handler)
}

export const cleanAndAddEventListener = <T>(
  element: Document | HTMLElement,
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
