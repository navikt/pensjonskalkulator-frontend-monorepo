import type { IntlShape } from 'react-intl'

import { externalUrls } from '@/router/constants'
import type { Translations } from '@/translations/nb'

type TpOrdningGruppe = 'spk' | 'klp' | 'storebrand'

interface TpOrdning {
  gruppe: TpOrdningGruppe
  navn?: string
  kortnavn?: string
  url?: string
}

const tpOrdninger: Record<string, TpOrdning> = {
  '3010': { gruppe: 'spk' },
  '3060': { gruppe: 'spk' },
  '4082': { gruppe: 'klp' },
  '3200': { gruppe: 'klp' },
  '4083': {
    gruppe: 'storebrand',
    navn: 'Bærum Kommunale Pensjonskasse',
    kortnavn: 'BKP',
    url: externalUrls.bkp,
  },
  '4098': {
    gruppe: 'storebrand',
    navn: 'Pensjonskassen for Helseforetakene i Hovedstadsområdet',
    kortnavn: 'PKH',
    url: externalUrls.pkh,
  },
  '3670': {
    gruppe: 'storebrand',
    navn: 'Elverum Kommunale Pensjonskasse',
    kortnavn: 'Elverum Kommunale Pensjonskasse',
    url: externalUrls.elverumPensjon,
  },
}

export const getTpOrdningNavn = (
  tpNummer: string | undefined,
  fallbackNavn?: string
) => (tpNummer && tpOrdninger[tpNummer]?.navn) || fallbackNavn

export const getTpLeverandoerNavnListe = (
  muligeTpLeverandoerListe: Array<
    string | { tpNummer: string; tpNavn: string }
  > = []
): string[] =>
  muligeTpLeverandoerListe.map((tpLeverandoer) =>
    typeof tpLeverandoer === 'string'
      ? tpLeverandoer
      : (getTpOrdningNavn(tpLeverandoer.tpNummer) ?? tpLeverandoer.tpNavn)
  )

export const getTpOrdningLenke = (
  tpNummer: string,
  fallbackNavn?: string
): { kortnavn: string; url?: string } => {
  const tpOrdning = tpOrdninger[tpNummer]
  return {
    kortnavn: tpOrdning?.kortnavn ?? fallbackNavn ?? '',
    url: tpOrdning?.url,
  }
}

export const getLeverandoerHeading = (
  intl: IntlShape,
  tpNummer: string,
  tpLeverandoer?: string
) => {
  const gruppe = tpOrdninger[tpNummer]?.gruppe
  if (gruppe === 'spk' || gruppe === 'klp') {
    return intl.formatMessage({
      id: `pensjonsavtaler.offentligtp.subtitle.${gruppe}`,
    })
  }

  const navn = getTpOrdningNavn(tpNummer)
  if (navn) {
    return intl.formatMessage(
      { id: 'pensjonsavtaler.offentligtp.subtitle.tp_ordning' },
      { tpOrdningNavn: navn }
    )
  }
  return tpLeverandoer
}

export const getInfoOmAfpOgBetingetTjenestepensjon = (
  tpNummer: string,
  afp: AfpRadio | null,
  betingetTjenestepensjonErInkludert?: boolean
): keyof Translations => {
  const gruppe = tpOrdninger[tpNummer]?.gruppe
  const harValgtAfp = afp === 'ja_offentlig' || afp === 'ja_privat'

  if (gruppe === 'klp') {
    return harValgtAfp
      ? 'pensjonsavtaler.offentligtp.klp.afp_ja'
      : 'pensjonsavtaler.offentligtp.klp.afp_nei+vetikke'
  }

  if (gruppe !== 'spk') {
    return harValgtAfp
      ? 'pensjonsavtaler.offentligtp.tp_ordning.afp_ja'
      : 'pensjonsavtaler.offentligtp.tp_ordning.afp_nei+vetikke'
  }

  if (harValgtAfp) {
    return 'pensjonsavtaler.offentligtp.spk.afp_ja'
  } else if (afp === 'vet_ikke') {
    return 'pensjonsavtaler.offentligtp.spk.afp_vet_ikke'
  } else if (betingetTjenestepensjonErInkludert) {
    return 'pensjonsavtaler.offentligtp.spk.afp_nei.med_betinget'
  }
  return 'pensjonsavtaler.offentligtp.spk.afp_nei.uten_betinget'
}

export const formatLeverandoerList = (
  locale: string,
  leverandoerList: string[]
) =>
  Intl.ListFormat
    ? new Intl.ListFormat(locale, { type: 'disjunction' }).format(
        leverandoerList
      )
    : leverandoerList.join(', ')
