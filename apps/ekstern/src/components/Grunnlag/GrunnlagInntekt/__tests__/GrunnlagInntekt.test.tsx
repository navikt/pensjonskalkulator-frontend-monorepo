import { GrunnlagInntekt } from '..'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import {
  render,
  screen,
  swallowErrorsAsync,
  userEvent,
  waitFor,
} from '@/test-utils'

describe('GrunnlagInntekt', () => {
  describe('Gitt at brukeren har inntekt hentet fra Skatteetaten', () => {
    const user = userEvent.setup()
    beforeEach(async () => {
      render(<GrunnlagInntekt />)
      expect(await screen.findByText('grunnlag.inntekt.title')).toBeVisible()
      expect(await screen.findByText('521 338 kr')).toBeVisible()
      const buttons = screen.getAllByRole('button')
      await user.click(buttons[2])
    })

    it('viser riktig tittel med formatert inntekt og tekst', async () => {
      expect(
        await screen.findByText(
          'Beløpet blir brukt som din fremtidige inntekt frem til du starter uttak av pensjon',
          { exact: false }
        )
      ).toBeVisible()
      expect(await screen.findByText('2021', { exact: false })).toBeVisible()
    })

    it('brukeren kan overskrive den', async () => {
      await user.click(
        await screen.findByText('inntekt.endre_inntekt_modal.open.button')
      )

      await user.type(await screen.findByTestId('inntekt-textfield'), '123000')
      await user.click(
        await screen.findByText('inntekt.endre_inntekt_modal.button')
      )

      expect(await screen.findByText('123 000 kr')).toBeVisible()
      expect(
        screen.queryByText('grunnlag.inntekt.title.error')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('grunnlag.inntekt.ingress.error')
      ).not.toBeInTheDocument()
      expect(
        await screen.findByText(
          'Beløpet blir brukt som din fremtidige inntekt frem til du starter uttak av pensjon',
          { exact: false }
        )
      ).toBeVisible()
    })

    it('brukeren kan gå ut av modulen og la inntekt uendret', async () => {
      await user.click(
        await screen.findByText('inntekt.endre_inntekt_modal.open.button')
      )
      await user.click(await screen.findByText('stegvisning.avbryt'))
      expect(await screen.findByText('521 338 kr')).toBeVisible()
    })
  })

  describe('Gitt at brukeren ikke har noe inntekt', () => {
    it('viser riktig tittel og tekst når inntekt ikke kunne hentes', async () => {
      mockErrorResponse('/inntekt')
      const user = userEvent.setup()
      render(<GrunnlagInntekt />)
      expect(await screen.findByText('grunnlag.inntekt.title')).toBeVisible()
      expect(
        await screen.findByText('grunnlag.inntekt.title.error')
      ).toBeVisible()
      expect(screen.queryByText('0 kr')).not.toBeInTheDocument()

      const buttons = await screen.findAllByRole('button')
      await user.click(buttons[2])

      expect(
        await screen.findByText('grunnlag.inntekt.ingress.error')
      ).toBeVisible()
      expect(
        screen.queryByText(
          'Beløpet blir brukt som din fremtidige inntekt frem til du starter uttak av pensjon',
          { exact: false }
        )
      ).not.toBeInTheDocument()
      expect(
        await screen.findByText('inntekt.info_modal.open.link')
      ).toBeVisible()
      expect(
        await screen.findByText('inntekt.endre_inntekt_modal.open.button')
      ).toBeVisible()
    })

    it('viser riktig tittel og tekst med 0 inntekt, og brukeren kan overskrive den', async () => {
      const user = userEvent.setup()
      swallowErrorsAsync(async () => {
        mockResponse('/inntekt', {
          status: 200,
          json: { aar: '2021', beloep: 0 },
        })

        render(<GrunnlagInntekt />)
      })
      expect(await screen.findByText('grunnlag.inntekt.title')).toBeVisible()
      expect(
        await screen.findByText('grunnlag.inntekt.title.error')
      ).toBeVisible()
      expect(screen.queryByText('0 kr')).not.toBeInTheDocument()
      const buttons = screen.getAllByRole('button')

      await user.click(buttons[2])

      expect(
        await screen.findByText('grunnlag.inntekt.ingress.error')
      ).toBeVisible()
      waitFor(() => {
        expect(
          screen.queryByText(
            'Beløpet blir brukt som din fremtidige inntekt frem til du starter uttak av pensjon',
            { exact: false }
          )
        ).not.toBeInTheDocument()
      })
      expect(
        await screen.findByText('inntekt.info_modal.open.link')
      ).toBeVisible()
      expect(
        await screen.findByText('inntekt.endre_inntekt_modal.open.button')
      ).toBeVisible()
    })
  })

  it('brukeren kan åpne modal for å lese mer om pensjonsgivende inntekt', async () => {
    const user = userEvent.setup()
    render(<GrunnlagInntekt />)

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[2])
    await user.click(await screen.findByText('inntekt.info_modal.open.link'))
    expect(await screen.findByText('inntekt.info_modal.title')).toBeVisible()
    expect(await screen.findByText('inntekt.info_modal.subtitle')).toBeVisible()
    await user.click(await screen.findByText('inntekt.info_modal.lukk'))
    expect(screen.queryByText('inntekt.info_modal.title')).not.toBeVisible()
  })
})
