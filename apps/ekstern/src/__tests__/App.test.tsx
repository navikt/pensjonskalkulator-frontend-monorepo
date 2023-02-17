import renderer from 'react-test-renderer'

import { expect, test } from 'vitest'

import App from '../App'
import { toJson, render, userEvent, screen } from '../test-utils'

test('Når App importeres, Så rendres den slik den skal', () => {
  const component = renderer.create(<App />)
  const tree = toJson(component)
  expect(tree).toMatchSnapshot()
})

test('Når brukeren klikker på count knappen, Så øker count', async () => {
  render(<App />)
  const btn = screen.getByRole('button')
  expect(btn.textContent).toBe('count is 0')
  await userEvent.click(btn)
  expect(btn.textContent).toBe('count is 1')
})
