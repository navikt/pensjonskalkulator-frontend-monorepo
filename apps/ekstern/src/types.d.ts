declare namespace JSX {
  interface IntrinsicElements {
    ['representasjon-banner']: CustomElement<{
      representasjonstyper?: string
      redirectTo: string
      style?: React.CSSProperties
    }>
  }
}
