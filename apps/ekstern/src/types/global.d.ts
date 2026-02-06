declare module 'csstype' {
  interface Properties {
    [index: `--${string}`]: number | string
  }
}

declare global {
  interface Window {
    Playwright: unknown
    router: Router
    store: AppStore
  }
}

export {}
