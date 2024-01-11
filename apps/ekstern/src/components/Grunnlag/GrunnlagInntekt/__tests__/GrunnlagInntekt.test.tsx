import { GrunnlagInntekt } from '..'
import { mockResponse } from '@/mocks/server'
import { apiSlice } from '@/state/api/apiSlice'
import { render, screen, userEvent } from '@/test-utils'

describe('GrunnlagInntekt', () => {
  describe('Gitt at brukeren har inntekt hentet fra Skatteetaten', () => {
    const user = userEvent.setup()
    beforeEach(async () => {
      const { store } = render(<GrunnlagInntekt />)
      store.dispatch(apiSlice.endpoints.getInntekt.initiate())
      expect(await screen.findByText('grunnlag.inntekt.title')).toBeVisible()
      expect(await screen.findByText('521 338 kr')).toBeVisible()
      await user.click(await screen.findByTestId('accordion-header'))
    })

    it('viser riktig tittel med formatert inntekt og tekst', async () => {
      expect(
        screen.getByText('runnlag.inntekt.ingress.uendret_inntekt', {
          exact: false,
        })
      ).toBeVisible()
      expect(
        screen.getByText(
          'Din siste pensjonsgivende inntekt fra Skatteetaten er',
          { exact: false }
        )
      ).toBeVisible()
      expect(await screen.findByText('2021', { exact: false })).toBeVisible()
    })

    it('brukeren kan overskrive den, og det vises riktig tittel med formatert inntekt og tekst', async () => {
      await user.click(
        screen.getByText('inntekt.endre_inntekt_modal.open.button')
      )

      await user.type(screen.getByTestId('inntekt-textfield'), '123000')
      await user.click(screen.getByText('inntekt.endre_inntekt_modal.button'))

      expect(screen.getByText('123 000 kr')).toBeVisible()
      expect(
        screen.getByText('runnlag.inntekt.ingress.endret_inntekt', {
          exact: false,
        })
      ).toBeVisible()
      expect(
        screen.getByText(
          'Din siste pensjonsgivende inntekt fra Skatteetaten er',
          { exact: false }
        )
      ).toBeVisible()
    })

    it('brukeren kan gå ut av modulen og la inntekt uendret', async () => {
      await user.click(
        screen.getByText('inntekt.endre_inntekt_modal.open.button')
      )
      await user.click(screen.getByText('stegvisning.avbryt'))
      expect(screen.getByText('521 338 kr')).toBeVisible()
      expect(
        screen.getByText('runnlag.inntekt.ingress.uendret_inntekt', {
          exact: false,
        })
      ).toBeVisible()
      expect(
        screen.getByText(
          'Din siste pensjonsgivende inntekt fra Skatteetaten er',
          { exact: false }
        )
      ).toBeVisible()
    })
  })

  describe('Gitt at brukeren ikke har noe inntekt', () => {
    it('viser riktig tittel og tekst med 0 inntekt, og brukeren kan overskrive den', async () => {
      const user = userEvent.setup()
      mockResponse('/inntekt', {
        status: 200,
        json: { aar: '2021', beloep: 0 },
      })
      const { store } = render(<GrunnlagInntekt />)
      store.dispatch(apiSlice.endpoints.getInntekt.initiate())

      expect(await screen.findByText('grunnlag.inntekt.title')).toBeVisible()
      expect(await screen.findByText('0 kr')).toBeVisible()
      await user.click(await screen.findByTestId('accordion-header'))

      expect(
        await screen.findByText('grunnlag.inntekt.ingress.uendret_inntekt', {
          exact: false,
        })
      ).toBeVisible()

      await user.click(
        screen.getByText('inntekt.endre_inntekt_modal.open.button')
      )

      await user.type(screen.getByTestId('inntekt-textfield'), '123000')
      await user.click(screen.getByText('inntekt.endre_inntekt_modal.button'))

      expect(screen.getByText('123 000 kr')).toBeVisible()
      expect(screen.queryByText('0 kr')).not.toBeInTheDocument()

      expect(
        await screen.findByText('grunnlag.inntekt.ingress.endret_inntekt', {
          exact: false,
        })
      ).toBeVisible()
      expect(
        screen.getByText(
          'Din siste pensjonsgivende inntekt fra Skatteetaten er',
          { exact: false }
        )
      ).toBeVisible()
      expect(screen.getByText('inntekt.info_modal.open.link')).toBeVisible()
      expect(
        screen.getByText('inntekt.endre_inntekt_modal.open.button')
      ).toBeVisible()
    })
  })

  it('brukeren kan åpne modal for å lese mer om pensjonsgivende inntekt', async () => {
    const user = userEvent.setup()
    render(<GrunnlagInntekt />)

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[2])
    await user.click(screen.getByText('inntekt.info_modal.open.link'))
    expect(screen.getByText('inntekt.info_modal.title')).toBeVisible()
    expect(screen.getByText('inntekt.info_modal.subtitle')).toBeVisible()
    await user.click(screen.getByText('inntekt.info_modal.lukk'))
    expect(screen.queryByText('inntekt.info_modal.title')).not.toBeVisible()
  })
})
