import type { IntlShape } from 'react-intl'

import type { Translations } from '@/translations/nb'

const leverandoerMessageKeyMap: Record<string, string> = {
  'Statens pensjonskasse': 'pensjonsavtaler.offentligtp.subtitle.spk',
  'Kommunal Landspensjonskasse': 'pensjonsavtaler.offentligtp.subtitle.klp',
}

export const getLeverandoerHeading = (
  intl: IntlShape,
  tpLeverandoer: string
) => {
  if (tpLeverandoer in leverandoerMessageKeyMap) {
    return intl.formatMessage({ id: leverandoerMessageKeyMap[tpLeverandoer] })
  }
  return tpLeverandoer
}

export const getInfoOmAfpOgBetingetTjenestepensjon = (
  tpLeverandoer: string,
  afp: AfpRadio | null,
  betingetTjenestepensjonErInkludert?: boolean
): keyof Translations => {
  if (tpLeverandoer === 'Kommunal Landspensjonskasse') {
    if (afp === 'ja_offentlig' || afp === 'ja_privat') {
      return 'pensjonsavtaler.offentligtp.klp.afp_ja'
    }
    return 'pensjonsavtaler.offentligtp.klp.afp_nei+vetikke'
  }

  // SPK
  if (afp === 'ja_offentlig' || afp === 'ja_privat') {
    return 'pensjonsavtaler.offentligtp.spk.afp_ja'
  } else if (afp === 'vet_ikke') {
    return 'pensjonsavtaler.offentligtp.spk.afp_vet_ikke'
  } else {
    if (betingetTjenestepensjonErInkludert) {
      return 'pensjonsavtaler.offentligtp.spk.afp_nei.med_betinget'
    } else {
      return 'pensjonsavtaler.offentligtp.spk.afp_nei.uten_betinget'
    }
  }
}
