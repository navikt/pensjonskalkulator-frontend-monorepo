import { describe, it } from 'vitest'

import { VilkaarsproevingAlert } from '..'
import { render, screen } from '@/test-utils'
import { DEFAULT_UBETINGET_UTTAKSALDER } from '@/utils/alder'

describe('VilkaarsproevingAlert', () => {
  const uttaksalder = { aar: 63, maaneder: 3 }
  const vilkaarsproeving = {
    vilkaarErOppfylt: false,
    alternativ: {
      gradertUttaksalder: undefined,
      uttaksgrad: undefined,
      heltUttaksalder: { aar: 65, maaneder: 3 },
    },
  }
  it('Når det foreslåtte alternativet er den default ubetinget uttaksalder, vises det riktig tekst', () => {
    const { asFragment } = render(
      <VilkaarsproevingAlert
        vilkaarsproeving={{
          ...vilkaarsproeving,
          alternativ: {
            ...vilkaarsproeving.alternativ,
            heltUttaksalder: { ...DEFAULT_UBETINGET_UTTAKSALDER },
          },
        }}
        uttaksalder={uttaksalder}
      />
    )

    expect(
      screen.getByText('beregning.vilkaarsproeving.intro', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Du kan tidligst ta ut alderspensjon ved 67 år.', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(asFragment()).toMatchSnapshot()
  })

  it('Når det foreslåtte alternativet er uttaksalder for 100% uten gradering, vises det riktig tekst', () => {
    const { asFragment } = render(
      <VilkaarsproevingAlert
        vilkaarsproeving={vilkaarsproeving}
        uttaksalder={uttaksalder}
      />
    )

    expect(
      screen.getByText('beregning.vilkaarsproeving.intro', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Du må øke alderen eller sette ned uttaksgraden.', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Du kan ved 65 år og 3 måneder ta ut', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('100 %', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Du kan også prøve andre kombinasjoner.', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(asFragment()).toMatchSnapshot()
  })

  it('Når det foreslåtte alternativet er lik uttaksalder med ny gradering, vises det riktig tekst', () => {
    const { asFragment } = render(
      <VilkaarsproevingAlert
        vilkaarsproeving={{
          ...vilkaarsproeving,
          alternativ: {
            ...vilkaarsproeving.alternativ,
            heltUttaksalder: { ...uttaksalder },
            gradertUttaksalder: { aar: 65, maaneder: 3 },
            uttaksgrad: 40,
          },
        }}
        uttaksalder={uttaksalder}
      />
    )

    expect(
      screen.getByText('beregning.vilkaarsproeving.intro', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Du må øke alderen eller sette ned uttaksgraden.', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Du kan ved 65 år og 3 måneder ta ut', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('40 %', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Du kan også prøve andre kombinasjoner.', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(asFragment()).toMatchSnapshot()
  })

  it('Når det foreslåtte alternativet er ulik uttaksalder med ny gradering, vises det riktig tekst', () => {
    const { asFragment } = render(
      <VilkaarsproevingAlert
        vilkaarsproeving={{
          ...vilkaarsproeving,
          alternativ: {
            ...vilkaarsproeving.alternativ,
            gradertUttaksalder: { aar: 68, maaneder: 5 },
            uttaksgrad: 40,
          },
        }}
        uttaksalder={uttaksalder}
      />
    )

    expect(
      screen.getByText('beregning.vilkaarsproeving.intro', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Du må øke alderen eller sette ned uttaksgraden.', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Du kan ved 68 år og 5 måneder ta ut', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('40 %', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('100 %', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('ved 65 år og 3 måneder eller senere', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Du kan også prøve andre kombinasjoner.', {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(asFragment()).toMatchSnapshot()
  })
})
