import renderer, { ReactTestRenderer } from 'react-test-renderer'

import { describe, vi, expect, test } from 'vitest'

import App from '../App'
import {
  act,
  toJson,
  render,
  userEvent,
  screen,
  createSuccessFetchResponse,
  createFailureFetchResponse,
} from '../test-utils'

const data = require('../__mocks__/data.json')

function mockLivenessSuccess() {
  const fetchMock = vi.fn().mockResolvedValue(createSuccessFetchResponse(data))
  global.fetch = fetchMock
}

function mockLivenessFailure() {
  const fetchMock = vi.fn().mockResolvedValue(createFailureFetchResponse())
  global.fetch = fetchMock
}

function mockConsole() {
  const consoleMock = vi.fn()
  global.console.warn = consoleMock
}

describe('Gitt at appen importeres,', () => {
  test('Når Appen starter, Så lages det en GET request til liveness status', async () => {
    mockLivenessSuccess()
    await act(async () => {
      renderer.create(<App />)
    })
    expect(fetch).toHaveBeenCalledWith('/internal/health/liveness', {
      method: 'GET',
    })
  })

  test('Når Appen starter og at requesten er vellykket, Så rendres den slik den skal', async () => {
    mockLivenessSuccess()
    const component = renderer.create(<App />)
    await act(async () => {
      const tree = toJson(component)
      expect(tree).toMatchSnapshot()
    })
  })

  test('Når Appen starter og at requesten feiler, Så logges feilmeldingen og appen vises uten liveness status', async () => {
    mockLivenessFailure()
    mockConsole()
    let component
    await act(async () => {
      component = renderer.create(<App />)
    })
    expect(fetch).toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalledWith(new Error('Something went wrong'))
    const tree = toJson(component as unknown as ReactTestRenderer)
    expect(tree).toMatchSnapshot()
  })
})

test('Når brukeren klikker på count knappen, Så øker count', async () => {
  render(<App />)
  const btn = screen.getByRole('button')
  expect(btn.textContent).toBe('count is 0')
  await userEvent.click(btn)
  expect(btn.textContent).toBe('count is 1')
})
