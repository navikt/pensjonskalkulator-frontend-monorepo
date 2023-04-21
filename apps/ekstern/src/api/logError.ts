import { fetch } from 'cross-fetch'
import { getHost } from '@/api/paths'

export const logError = (message: string, stack: string): Promise<Response> => {
  return fetch(`${getHost(import.meta.env.MODE)}/client_error_trace`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: `${message}\n${stack}`,
  })
}
