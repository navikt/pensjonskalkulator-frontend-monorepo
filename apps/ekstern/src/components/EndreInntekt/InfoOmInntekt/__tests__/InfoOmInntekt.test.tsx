import { render } from '@/test-utils'

import { InfoOmInntekt } from '..'

describe('InfoModalInntekt', () => {
  it('viser fast info om inntekt', async () => {
    const { getByTestId } = await render(<InfoOmInntekt />)

    // Check for lists
    const infoList = getByTestId('info-om-inntekt-list')
    expect(infoList.children.length).toBeGreaterThan(2)
  })
})
