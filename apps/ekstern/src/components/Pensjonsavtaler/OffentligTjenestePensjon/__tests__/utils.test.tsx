import { IntlProvider, useIntl } from 'react-intl'

import { describe, it } from 'vitest'

import {
  getInfoOmAfpOgBetingetTjenestepensjon,
  getLeverandoerHeading,
} from '../utils'
import { renderHook } from '@/test-utils'
import { getTranslation_nb } from '@/translations/nb'

const wrappedGetLeverandoerHeading = (leverandoer: string) => {
  const { result } = renderHook(
    () => getLeverandoerHeading(useIntl(), leverandoer),
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
    const heading = wrappedGetLeverandoerHeading('Statens pensjonskasse')
    expect(heading).toBe('Alderspensjon fra Statens pensjonskasse (SPK)')
  })

  it('Returnerer riktig overskrift for KLP.', () => {
    const heading = wrappedGetLeverandoerHeading('Kommunal Landspensjonskasse')
    expect(heading).toBe('Alderspensjon fra Kommunal Landspensjonskasse (KLP)')
  })

  it('Returnerer tpLeverandoer-parameteret hvis den er ugyldig.', () => {
    const heading = wrappedGetLeverandoerHeading('ugyldig verdi')
    expect(heading).toBe('ugyldig verdi')
  })
})

describe('getInfoOmAfpOgBetingetTjenestepensjon', () => {
  describe('Gitt at leverandør er KLP,', () => {
    it('returnerer riktig infotekst når AFP==ja_offentlig.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon(
        'Kommunal Landspensjonskasse',
        'ja_offentlig',
        false
      )
      expect(heading).toBe('pensjonsavtaler.offentligtp.klp.afp_ja')
    })
    it('returnerer riktig infotekst når AFP==ja_privat.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon(
        'Kommunal Landspensjonskasse',
        'ja_privat',
        false
      )
      expect(heading).toBe('pensjonsavtaler.offentligtp.klp.afp_ja')
    })
    it('returnerer riktig infotekst når AFP==nei.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon(
        'Kommunal Landspensjonskasse',
        'nei',
        false
      )
      expect(heading).toBe('pensjonsavtaler.offentligtp.klp.afp_nei+vetikke')
    })
    it('returnerer riktig infotekst når AFP==vet_ikke.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon(
        'Kommunal Landspensjonskasse',
        'vet_ikke',
        false
      )
      expect(heading).toBe('pensjonsavtaler.offentligtp.klp.afp_nei+vetikke')
    })
  })

  describe('Gitt at leverandør er SPK,', () => {
    it('returnerer riktig infotekst når AFP==ja_offentlig.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon(
        'Statens pensjonskasse',
        'ja_offentlig',
        false
      )
      expect(heading).toBe('pensjonsavtaler.offentligtp.spk.afp_ja')
    })
    it('returnerer riktig infotekst når AFP==ja_privat.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon(
        'Statens pensjonskasse',
        'ja_privat',
        false
      )
      expect(heading).toBe('pensjonsavtaler.offentligtp.spk.afp_ja')
    })
    it('returnerer riktig infotekst når AFP==vet_ikke.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon(
        'Statens pensjonskasse',
        'vet_ikke',
        false
      )
      expect(heading).toBe('pensjonsavtaler.offentligtp.spk.afp_vet_ikke')
    })
    it('returnerer riktig infotekst når AFP==nei og betingetTjenestepensjonErInkludert==false.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon(
        'Statens pensjonskasse',
        'nei',
        false
      )
      expect(heading).toBe(
        'pensjonsavtaler.offentligtp.spk.afp_nei.uten_betinget'
      )
    })
    it('returnerer riktig infotekst når AFP==nei og betingetTjenestepensjonErInkludert==true.', () => {
      const heading = getInfoOmAfpOgBetingetTjenestepensjon(
        'Statens pensjonskasse',
        'nei',
        true
      )
      expect(heading).toBe(
        'pensjonsavtaler.offentligtp.spk.afp_nei.med_betinget'
      )
    })
  })
})
