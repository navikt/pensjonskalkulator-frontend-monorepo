import { ReadMoreOmPensjonsalder } from '..'
import { render, screen, userEvent } from '@/test-utils'

describe('ReadMoreOmPensjonsalder', () => {
  describe('Gitt at en bruker ikke har uføretrygd, ', () => {
    it('viser riktig info om pensjonsalder', async () => {
      const user = userEvent.setup()
      render(<ReadMoreOmPensjonsalder ufoeregrad={0} isEndring={false} />)
      await user.click(
        screen.getByText('beregning.read_more.pensjonsalder.label')
      )
      expect(
        screen.queryByText('omufoeretrygd.readmore.title')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('Aldersgrensene vil øke gradvis fra 1964-kullet', {
          exact: false,
        })
      ).toBeVisible()
    })

    it('Når brukeren har vedtak om alderspensjon, viser riktig info om pensjonsalder', async () => {
      const user = userEvent.setup()
      render(<ReadMoreOmPensjonsalder ufoeregrad={0} isEndring={true} />)
      await user.click(
        screen.getByText('beregning.read_more.pensjonsalder.label')
      )
      expect(
        screen.queryByText('omufoeretrygd.readmore.title')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('Aldersgrensene vil øke gradvis fra 1964-kullet', {
          exact: false,
        })
      ).not.toBeInTheDocument()

      expect(
        screen.getByText(
          'Opptjeningen din i folketrygden bestemmer hvor mye alderspensjon du kan ta ut. Ved 67 år må pensjonen minst tilsvare garantipensjon.',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })
  })
  describe('Når en bruker har gradert uføretrygd, ', () => {
    it('viser riktig info om pensjonsalder', async () => {
      const user = userEvent.setup()
      render(<ReadMoreOmPensjonsalder ufoeregrad={75} isEndring={false} />)
      await user.click(screen.getByText('omufoeretrygd.readmore.title'))
      expect(
        screen.queryByText('beregning.read_more.pensjonsalder.label')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText(
          'Din opptjening i folketrygden bestemmer når du kan ta ut alderspensjon. Ved 67 år må pensjonen minst tilsvare garantipensjon.',
          { exact: false }
        )
      ).toBeVisible()
    })

    it('Når brukeren har vedtak om alderspensjon, viser riktig info om pensjonsalder', async () => {
      const user = userEvent.setup()
      render(<ReadMoreOmPensjonsalder ufoeregrad={75} isEndring={true} />)
      await user.click(screen.getByText('omufoeretrygd.readmore.title'))
      expect(
        screen.queryByText('beregning.read_more.pensjonsalder.label')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(
          'Din opptjening i folketrygden bestemmer når du kan ta ut alderspensjon. Ved 67 år må pensjonen minst tilsvare garantipensjon.',
          {
            exact: false,
          }
        )
      ).not.toBeInTheDocument()
      expect(
        screen.getByText(
          'Uttaksgrad angir hvor stor del av månedlig alderspensjon du ønsker å ta ut',
          { exact: false }
        )
      ).toBeVisible()
    })
  })

  describe('Når en bruker har 100 % uføretrygd, ', () => {
    it('viser riktig info om pensjonsalder', async () => {
      const user = userEvent.setup()
      render(<ReadMoreOmPensjonsalder ufoeregrad={100} isEndring={false} />)
      await user.click(screen.getByText('omufoeretrygd.readmore.title'))
      expect(
        screen.queryByText('beregning.read_more.pensjonsalder.label')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText(
          'Det er derfor ikke mulig å beregne alderspensjon før 67 år i kalkulatoren.',
          { exact: false }
        )
      ).toBeVisible()
    })
    it('Når brukeren har vedtak om alderspensjon, viser riktig info om pensjonsalder', async () => {
      const user = userEvent.setup()
      render(<ReadMoreOmPensjonsalder ufoeregrad={100} isEndring={true} />)
      await user.click(screen.getByText('omufoeretrygd.readmore.title'))
      expect(
        screen.queryByText('beregning.read_more.pensjonsalder.label')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(
          'Det er derfor ikke mulig å beregne alderspensjon før 67 år i kalkulatoren.',
          {
            exact: false,
          }
        )
      ).not.toBeInTheDocument()
      expect(
        screen.getByText(
          'Uttaksgrad angir hvor stor del av månedlig alderspensjon du ønsker å ta ut',
          { exact: false }
        )
      ).toBeVisible()
    })
  })
})
