import { GrunnlagInntekt } from '..'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { render, screen, userEvent } from '@/test-utils'

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
        screen.getByText(
          'Beløpet blir brukt som din fremtidige inntekt frem til du starter uttak av pensjon',
          { exact: false }
        )
      ).toBeVisible()
      expect(await screen.findByText('2021', { exact: false })).toBeVisible()
    })

    it('brukeren kan overskrive den og input valideres', async () => {
      await user.click(screen.getByText('grunnlag.inntekt.button'))
      await user.click(screen.getByText('grunnlag.inntekt.inntektmodal.button'))
      expect(
        await screen.findByText(
          'grunnlag.inntekt.inntektmodal.textfield.validation_error.required'
        )
      ).toBeInTheDocument()
      await user.type(screen.getByTestId('inntekt-textfield'), '123000')
      expect(
        screen.queryByText(
          'grunnlag.inntekt.inntektmodal.textfield.validation_error'
        )
      ).not.toBeInTheDocument()
    })

    it('brukeren kan gå ut av modulen og la inntekt uendret', async () => {
      await user.click(screen.getByText('grunnlag.inntekt.button'))
      await user.click(screen.getByText('stegvisning.avbryt'))
      expect(screen.getByText('521 338 kr')).toBeVisible()
    })
  })

  describe('Gitt at brukeren ikke har noe inntekt', () => {
    it('viser riktig tittel og tekst når inntekt ikke kunne hentes', async () => {
      mockErrorResponse('/inntekt')
      const user = userEvent.setup()
      render(<GrunnlagInntekt />)
      expect(screen.getByText('grunnlag.inntekt.title')).toBeVisible()
      expect(screen.getByText('grunnlag.inntekt.title.error')).toBeVisible()
      expect(screen.queryByText('0 kr')).not.toBeInTheDocument()
      const buttons = screen.getAllByRole('button')

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
      expect(screen.getByText('grunnlag.inntekt.link')).toBeVisible()
      expect(screen.getByText('grunnlag.inntekt.button')).toBeVisible()
    })

    it('viser riktig tittel og tekst med 0 inntekt, og brukeren kan overskrive den', async () => {
      mockResponse('/inntekt', {
        status: 200,
        json: { aar: '2021', beloep: 0 },
      })
      const user = userEvent.setup()
      render(<GrunnlagInntekt />)
      expect(screen.getByText('grunnlag.inntekt.title')).toBeVisible()
      expect(screen.getByText('grunnlag.inntekt.title.error')).toBeVisible()
      expect(screen.queryByText('0 kr')).not.toBeInTheDocument()
      const buttons = screen.getAllByRole('button')

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
      expect(screen.getByText('grunnlag.inntekt.link')).toBeVisible()
      expect(screen.getByText('grunnlag.inntekt.button')).toBeVisible()

      await user.click(screen.getByText('grunnlag.inntekt.button'))
      await user.type(screen.getByTestId('inntekt-textfield'), '123000')
      await user.click(screen.getByText('grunnlag.inntekt.inntektmodal.button'))

      expect(screen.getByText('123 000 kr')).toBeVisible()
      expect(
        screen.queryByText('grunnlag.inntekt.title.error')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('grunnlag.inntekt.ingress.error')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText(
          'Beløpet blir brukt som din fremtidige inntekt frem til du starter uttak av pensjon',
          { exact: false }
        )
      ).toBeVisible()
    })
  })

  it('brukeren kan åpne modal for å lese mer om pensjonsgivende inntekt', async () => {
    const user = userEvent.setup()
    render(<GrunnlagInntekt />)

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[2])
    await user.click(screen.getByText('grunnlag.inntekt.link'))
    expect(screen.getByText('grunnlag.inntekt.infomodal.title')).toBeVisible()
    expect(
      screen.getByText('grunnlag.inntekt.infomodal.subtitle')
    ).toBeVisible()
    await user.click(screen.getByText('grunnlag.inntekt.infomodal.lukk'))
    expect(
      screen.queryByText('grunnlag.inntekt.infomodal.title')
    ).not.toBeVisible()
  })
})
