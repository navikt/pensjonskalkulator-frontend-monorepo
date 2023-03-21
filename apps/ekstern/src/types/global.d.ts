declare module 'csstype' {
  interface Properties {
    [index: `--${string}`]: number | string
  }
}
