declare module 'csstype' {
  interface Properties {
    [index: `--${string}`]: number | string
  }
}

declare global {
  interface Window {
    Cypress: unknown
    router: Router
    store: AppStore
    reload?: function
  }
}

window.Cypress = window.Cypress || {}

export {}
