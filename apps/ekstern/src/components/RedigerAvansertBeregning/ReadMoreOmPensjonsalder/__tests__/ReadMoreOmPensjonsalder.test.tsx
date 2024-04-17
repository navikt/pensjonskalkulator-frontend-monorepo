import { ReadMoreOmPensjonsalder } from '..'
import { render, screen, userEvent } from '@/test-utils'

describe('ReadMoreOmPensjonsalder', () => {
  it('viser riktig info om pensjonsalder', async () => {
    const user = userEvent.setup()
    const { asFragment } = render(<ReadMoreOmPensjonsalder />)
    await user.click(
      await screen.findByText(
        'beregning.avansert.rediger.read_more.pensjonsalder.label'
      )
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
