import { IntlProvider, useIntl } from 'react-intl'
import { describe, it } from 'vitest'

import { renderHook } from '@/test-utils'
import { getTranslation_nb } from '@/translations/nb'

import {
  formatLeverandoerList,
  getInfoOmAfpOgBetingetTjenestepensjon,
  getLeverandoerHeading,
} from '../utils'

const wrappedGetLeverandoerHeading = (
  tpNummer: string,
  leverandoer: string
) => {
  const { result } = renderHook(
    () => getLeverandoerHeading(useIntl(), tpNummer, leverandoer),
    {
      wrapper: ({ children }) => (
        <IntlProvider locale="nb" messages={getTranslation_nb()}>
          {children}
        </IntlProvider>
      ),
    }
  )
  return result.current
}

describe('getLeverandoerHeading', () => {
  it('Returnerer riktig overskrift for SPK.', () => {
    const heading = wrappedGetLeverandoerHeading('3010', 'Fallback')
    expect(heading).toBe('Alderspensjon fra Statens pensjonskasse (SPK)')
  })

  it('Returnerer riktig overskrift for KLP.', () => {
    const heading = wrappedGetLeverandoerHeading('4080', 'Fallback')
    expect(heading).toBe('Alderspensjon fra Kommunal Landspensjonskasse (KLP)')
  })

  it('Returnerer tpLeverandoer-parameteret hvis tpNummer er ugyldig.', () => {
    const heading = wrappedGetLeverandoerHeading('0000', 'ugyldig verdi')
    expect(heading).toBe('ugyldig verdi')
  })
})

describe('getInfoOmAfpOgBetingetTjenestepensjon', () => {
  describe('Gitt at leverandør er KLP,', () => {
    it('returnerer riktig infotekst når AFP==ja_offentlig.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon(
        '4080',
        'ja_offentlig',
        false
      )
      expect(heading).toBe('pensjonsavtaler.offentligtp.klp.afp_ja')
    })
    it('returnerer riktig infotekst når AFP==ja_privat.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon(
        '4080',
        'ja_privat',
        false
      )
      expect(heading).toBe('pensjonsavtaler.offentligtp.klp.afp_ja')
    })
    it('returnerer riktig infotekst når AFP==nei.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon(
        '3200',
        'nei',
        false
      )
      expect(heading).toBe('pensjonsavtaler.offentligtp.klp.afp_nei+vetikke')
    })
    it('returnerer riktig infotekst når AFP==vet_ikke.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon(
        '3200',
        'vet_ikke',
        false
      )
      expect(heading).toBe('pensjonsavtaler.offentligtp.klp.afp_nei+vetikke')
    })
  })

  describe('Gitt at leverandør er SPK,', () => {
    it('returnerer riktig infotekst når AFP==ja_offentlig.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon(
        '3010',
        'ja_offentlig',
        false
      )
      expect(heading).toBe('pensjonsavtaler.offentligtp.spk.afp_ja')
    })
    it('returnerer riktig infotekst når AFP==ja_privat.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon(
        '3010',
        'ja_privat',
        false
      )
      expect(heading).toBe('pensjonsavtaler.offentligtp.spk.afp_ja')
    })
    it('returnerer riktig infotekst når AFP==vet_ikke.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon(
        '3060',
        'vet_ikke',
        false
      )
      expect(heading).toBe('pensjonsavtaler.offentligtp.spk.afp_vet_ikke')
    })
    it('returnerer riktig infotekst når AFP==nei og betingetTjenestepensjonErInkludert==false.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon(
        '3060',
        'nei',
        false
      )
      expect(heading).toBe(
        'pensjonsavtaler.offentligtp.spk.afp_nei.uten_betinget'
      )
    })
    it('returnerer riktig infotekst når AFP==nei og betingetTjenestepensjonErInkludert==true.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon('3010', 'nei', true)
      expect(heading).toBe(
        'pensjonsavtaler.offentligtp.spk.afp_nei.med_betinget'
      )
    })
  })
})

describe('formatLeverandoerList', () => {
  it('Returnerer tom string når listen er tom.', () => {
    const string = formatLeverandoerList('nb', [])
    expect(string).toBe('')
  })

  it('Returnerer riktig streng på bokmål.', () => {
    const string = formatLeverandoerList('nb', ['A', 'B', 'C'])
    expect(string).toBe('A, B eller C')
  })

  it('Returnerer riktig streng på nynorsk.', () => {
    const string = formatLeverandoerList('nn', ['A', 'B', 'C'])
    expect(string).toBe('A, B eller C')
  })

  it('Returnerer riktig streng på engelsk.', () => {
    const string = formatLeverandoerList('en', ['A', 'B', 'C'])
    expect(string).toBe('A, B, or C')
  })

  describe('Gitt at Intl.ListFormat er udefinert,', () => {
    beforeEach(() => {
      // @ts-expect-error - Simulerer eldre nettlesere som ikke har Intl.ListFormat
      vi.spyOn(Intl, 'ListFormat', 'get').mockReturnValue(undefined)
    })

    it('returnerer tom string når listen er tom.', () => {
      const string = formatLeverandoerList('nb', [])
      expect(string).toBe('')
    })

    it('returnerer riktig streng når listen ikke er tom.', () => {
      const string = formatLeverandoerList('nb', ['A', 'B', 'C'])
      expect(string).toBe('A, B, C')
    })
  })
})
