import { Accordion } from '@navikt/ds-react'

import { mockResponse } from '@/mocks/server'
import { apiSlice } from '@/state/api/apiSlice'
import { render, screen, userEvent } from '@/test-utils'

import { GrunnlagInntekt } from '..'

const WrappedGrunnlagInntekt = (
  props: React.ComponentProps<typeof GrunnlagInntekt>
) => (
  <Accordion>
    <GrunnlagInntekt {...props} />
  </Accordion>
)

describe('GrunnlagInntekt', () => {
  describe('Gitt at brukeren har inntekt hentet fra Skatteetaten', () => {
    const user = userEvent.setup()
    beforeEach(async () => {
      const { store } = render(
        <WrappedGrunnlagInntekt goToAvansert={vi.fn()} />
      )
      await store.dispatch(apiSlice.endpoints.getInntekt.initiate())
      await screen.findByText('grunnlag.inntekt.title')
      await screen.findAllByText('521 338 kr')
      await user.click(await screen.findByTestId('accordion-header'))
    })

    it('viser riktig tittel med formatert inntekt og tekst', async () => {
      expect(
        await screen.findByText(
          'Din siste pensjonsgivende inntekt fra Skatteetaten er',
          { exact: false }
        )
      ).toBeVisible()
      expect(await screen.findByText('2021', { exact: false })).toBeVisible()
    })

    it('brukeren kan overskrive den, og det vises riktig tittel med formatert inntekt og tekst', async () => {
      await user.click(
        await screen.findByText('inntekt.endre_inntekt_modal.open.button')
      )
      const textField = await screen.findByTestId('inntekt-textfield')
      await user.type(textField, '1')
      await user.type(textField, '2')
      await user.type(textField, '3')
      await user.type(textField, '0')
      await user.type(textField, '0')
      await user.type(textField, '0')
      await user.click(
        await screen.findByText('inntekt.endre_inntekt_modal.button')
      )

      expect(await screen.findByText('123 000 kr')).toBeVisible()

      expect(
        await screen.findByText(
          'Din siste pensjonsgivende inntekt fra Skatteetaten er',
          { exact: false }
        )
      ).toBeVisible()
    })

    it('brukeren kan gå ut av modulen og la inntekt uendret', async () => {
      await user.click(
        await screen.findByText('inntekt.endre_inntekt_modal.open.button')
      )
      await user.click(await screen.findByText('stegvisning.avbryt'))
      expect(screen.getAllByText('521 338 kr')).toHaveLength(2)
      expect(
        await screen.findByText(
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
        json: { aar: 2021, beloep: 0 },
      })
      const { store } = render(
        <WrappedGrunnlagInntekt goToAvansert={vi.fn()} />
      )
      await store.dispatch(apiSlice.endpoints.getInntekt.initiate())

      expect(await screen.findByText('grunnlag.inntekt.title')).toBeVisible()
      expect((await screen.findAllByText('0 kr')).length).toEqual(2)
      await user.click(await screen.findByTestId('accordion-header'))

      await user.click(
        await screen.findByText('inntekt.endre_inntekt_modal.open.button')
      )

      const textField = await screen.findByTestId('inntekt-textfield')
      await user.type(textField, '1')
      await user.type(textField, '2')
      await user.type(textField, '3')
      await user.type(textField, '0')
      await user.type(textField, '0')
      await user.type(textField, '0')

      await user.click(
        await screen.findByText('inntekt.endre_inntekt_modal.button')
      )

      expect(await screen.findByText('123 000 kr')).toBeVisible()
      expect(screen.queryAllByText('0 kr').length).toEqual(1)

      expect(
        await screen.findByText(
          'Din siste pensjonsgivende inntekt fra Skatteetaten er',
          { exact: false }
        )
      ).toBeVisible()
      expect(
        await screen.findByText('inntekt.info_om_inntekt.open.link')
      ).toBeVisible()
      expect(
        await screen.findByText('inntekt.info_om_inntekt.open.link')
      ).toBeVisible()
      expect(
        await screen.findByText('inntekt.endre_inntekt_modal.open.button')
      ).toBeVisible()
    })
  })

  it('brukeren kan åpne modal for å lese mer om pensjonsgivende inntekt', async () => {
    const user = userEvent.setup()
    render(<WrappedGrunnlagInntekt goToAvansert={vi.fn()} />)

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[2])
    await user.click(
      await screen.findByText('inntekt.info_om_inntekt.open.link')
    )
    expect(
      await screen.findByText('grunnlag.inntekt.info_om_inntekt')
    ).toBeVisible()
    expect(
      await screen.findByText('inntekt.info_om_inntekt.subtitle_1')
    ).toBeVisible()
    expect(
      await screen.findByText('inntekt.info_om_inntekt.subtitle_2')
    ).toBeVisible()
    await user.click(
      await screen.findByText('grunnlag.inntekt.info_om_inntekt.lukk')
    )
    expect(
      screen.queryByText('grunnlag.inntekt.info_om_inntekt')
    ).not.toBeVisible()
  })

  it('brukeren kan gå videre til avansert kalkulator ', async () => {
    const goToAvansertMock = vi.fn()
    const user = userEvent.setup()
    render(<WrappedGrunnlagInntekt goToAvansert={goToAvansertMock} />)

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[2])
    await user.click(
      await screen.findByText('inntekt.info_om_inntekt.open.link')
    )
    await user.click(await screen.findByText('grunnlag.inntekt.avansert_link'))
    expect(goToAvansertMock).toHaveBeenCalled()
  })
})
