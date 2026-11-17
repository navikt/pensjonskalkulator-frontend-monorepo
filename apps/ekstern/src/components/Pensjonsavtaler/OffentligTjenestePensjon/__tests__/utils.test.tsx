import { IntlProvider, useIntl } from 'react-intl'
import { describe, it } from 'vitest'

import { renderHook } from '@/test-utils'
import translations_nb from '@/translations/nb'

import {
  formatLeverandoerList,
  getInfoOmAfpOgBetingetTjenestepensjon,
  getLeverandoerHeading,
  getTpLeverandoerNavnListe,
  getTpOrdningLenke,
} from '../utils'

const wrappedGetLeverandoerHeading = (
  tpNummer: string,
  leverandoer: string
) => {
  const { result } = renderHook(
    () => getLeverandoerHeading(useIntl(), tpNummer, leverandoer),
    {
      wrapper: ({ children }) => (
        <IntlProvider locale="nb" messages={translations_nb}>
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
    const heading = wrappedGetLeverandoerHeading('4082', 'Fallback')
    expect(heading).toBe('Alderspensjon fra Kommunal Landspensjonskasse (KLP)')
  })

  it('Returnerer navnet på pensjonskassen for ordninger forvaltet av Storebrand.', () => {
    const heading = wrappedGetLeverandoerHeading('4098', 'Storebrand')
    expect(heading).toBe(
      'Alderspensjon fra Pensjonskassen for Helseforetakene i Hovedstadsområdet'
    )
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
        '4082',
        'ja_offentlig',
        false
      )
      expect(heading).toBe('pensjonsavtaler.offentligtp.klp.afp_ja')
    })
    it('returnerer riktig infotekst når AFP==ja_privat.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon(
        '4082',
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

  describe('Gitt at ordningen ikke er SPK eller KLP,', () => {
    it.each(['4083', '4098', '3670', '0000'])(
      'returnerer tekst for tp-ordning når AFP==ja_offentlig (tpNummer %s).',
      (tpNummer) => {
        expect(
          getInfoOmAfpOgBetingetTjenestepensjon(tpNummer, 'ja_offentlig', false)
        ).toBe('pensjonsavtaler.offentligtp.tp_ordning.afp_ja')
      }
    )
    it.each(['nei', 'vet_ikke'] as const)(
      'returnerer tekst for tp-ordning når AFP==%s.',
      (afp) => {
        expect(getInfoOmAfpOgBetingetTjenestepensjon('4083', afp, true)).toBe(
          'pensjonsavtaler.offentligtp.tp_ordning.afp_nei+vetikke'
        )
      }
    )
  })
})

describe('getTpOrdningLenke', () => {
  it('returnerer kortnavn og url for pensjonskassen basert på tpNummer.', () => {
    expect(getTpOrdningLenke('4083', 'Storebrand')).toEqual({
      kortnavn: 'BKP',
      url: 'https://www.bkp.no/',
    })
    expect(getTpOrdningLenke('4098')).toEqual({
      kortnavn: 'PKH',
      url: 'https://pkh.no/',
    })
  })

  it('returnerer fallback-navn uten url når tpNummer er ukjent.', () => {
    expect(getTpOrdningLenke('0000', 'Ukjent')).toEqual({
      kortnavn: 'Ukjent',
      url: undefined,
    })
  })
})

describe('getTpLeverandoerNavnListe', () => {
  it('slår opp navn fra tpNummer og faller tilbake til tpNavn.', () => {
    expect(
      getTpLeverandoerNavnListe([
        { tpNummer: '3670', tpNavn: 'Storebrand' },
        { tpNummer: '0000', tpNavn: 'Oslo Pensjonsforsikring' },
        'Kommunal Landspensjonskasse',
      ])
    ).toEqual([
      'Elverum Kommunale Pensjonskasse',
      'Oslo Pensjonsforsikring',
      'Kommunal Landspensjonskasse',
    ])
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
