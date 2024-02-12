import { ReadMoreOmPensjonsalder } from '..'
import { render, screen, userEvent } from '@/test-utils'

describe('ReadMoreOmPensjonsalder', () => {
  it('viser fast info om pensjonsalder', async () => {
    const user = userEvent.setup()
    const { asFragment } = render(<ReadMoreOmPensjonsalder />)
    await user.click(
      await screen.findByText(
        'beregning.avansert.rediger.read_more.pensjonsalder.label'
      )
    )
    expect(
      screen.queryByText(
        'Den oppgitte alderen er et estimat etter dagens regler.',
        { exact: false }
      )
    ).not.toBeInTheDocument()

    expect(asFragment()).toMatchSnapshot()
  })

  it('viser fast infoog optional info om pensjonsalder', async () => {
    const user = userEvent.setup()
    const { asFragment } = render(
      <ReadMoreOmPensjonsalder showTidligstMuligUttakOptionalIngress />
    )
    await user.click(
      await screen.findByText(
        'beregning.avansert.rediger.read_more.pensjonsalder.label'
      )
    )
    expect(
      screen.getByText(
        'Den oppgitte alderen er et estimat etter dagens regler.',
        { exact: false }
      )
    ).toBeInTheDocument()

    expect(asFragment()).toMatchSnapshot()
  })
})
