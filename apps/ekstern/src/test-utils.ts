import { render } from '@testing-library/react'

export const createSuccessFetchResponse = (data: Record<string, unknown>) => {
  return { ok: true, json: () => new Promise((resolve) => resolve(data)) }
}

export const createFailureFetchResponse = (statuscode?: number) => {
  return {
    status: statuscode ?? 404,
    json: () => new Promise((resolve) => resolve({})),
  }
}

export const swallowErrors = (testFn: () => void) => {
  const error = console.error
  console.error = () => {}
  testFn()
  console.error = error
}

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    // wrap provider(s) here if needed
    wrapper: ({ children }) => children,
    ...options,
  })

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
// override render export
export { customRender as render }
