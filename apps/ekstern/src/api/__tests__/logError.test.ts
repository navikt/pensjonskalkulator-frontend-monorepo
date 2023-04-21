import { logError } from '../logError'

describe('logError', () => {
  it('sender feil til backend', async () => {
    const response = await logError(
      'En feilmelding',
      '    at App (http://localhost:5173/pensjon/kalkulator/src/components/App/App.tsx)\n' +
        '    at Provider (http://localhost:5173/pensjon/kalkulator/node_modules/.vite/deps/chunk-OCX633EQ.js)\n' +
        '    at ErrorBoundary (http://localhost:5173/pensjon/kalkulator/src/components/ErrorBoundary/ErrorBoundary.tsx)'
    )

    expect(response.status).toBe(204)
  })
})
