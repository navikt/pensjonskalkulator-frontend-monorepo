import renderer from 'react-test-renderer'

import { render } from '@testing-library/react'

export function createSuccessFetchResponse(data: Record<string, unknown>) {
  return { ok: true, json: () => new Promise((resolve) => resolve(data)) }
}

export function createFailureFetchResponse(statuscode?: number) {
  return {
    status: statuscode ?? 404,
    json: () => new Promise((resolve) => resolve({})),
  }
}

export function toJson(component: renderer.ReactTestRenderer) {
  const result = component.toJSON()
  expect(result).toBeDefined()
  expect(result).not.toBeInstanceOf(Array)
  return result as renderer.ReactTestRendererJSON
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
