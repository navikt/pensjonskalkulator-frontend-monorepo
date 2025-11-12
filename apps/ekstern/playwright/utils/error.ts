export function handlePageError(error: unknown): void {
  if (!(error instanceof Error)) {
    console.error('Non-Error thrown:', error)
    return
  }

  if (
    error.message.includes('Analytics') ||
    error.stack?.includes(
      'representasjon-banner-frontend-borger-q2.ekstern.dev.nav.no'
    )
  )
    return
  console.error(error)
}
