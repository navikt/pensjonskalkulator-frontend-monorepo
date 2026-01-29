declare module 'csstype' {
  interface Properties {
    [index: `--${string}`]: number | string
  }
}

declare global {
  interface Window {
    Cypress: unknown
    Playwright: unknown
    router: Router
    store: AppStore
  }
}

window.Cypress = window.Cypress || {}

export {}
