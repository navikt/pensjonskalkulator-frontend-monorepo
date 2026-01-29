import { IntlShape } from 'react-intl'

import { isFoedtFoer1963 } from '@/utils/alder'

const getOffentligMessage = (intl: IntlShape) =>
  intl.formatMessage({ id: 'afp.offentlig' })
const getIkkeBeregnetMessage = (intl: IntlShape) =>
  intl.formatMessage({ id: 'grunnlag.afp.ikke_beregnet' })
const getPrivatMessage = (intl: IntlShape) =>
  intl.formatMessage({ id: 'afp.privat' })
const getNeiMessage = (intl: IntlShape) => intl.formatMessage({ id: 'afp.nei' })
const getVetIkkeMessage = (intl: IntlShape) =>
  intl.formatMessage({ id: 'afp.vet_ikke' })
const getEndringMessage = (intl: IntlShape) =>
  intl.formatMessage({ id: 'grunnlag.afp.endring' })

interface IAfpGrunnlagInput {
  afpUtregning: AfpUtregningValg
  afpValg: AfpRadio | null
  beregningsvalg: Beregningsvalg | null
  erApoteker: boolean
  foedselsdato: string
  loependeVedtak: LoependeVedtak
  samtykkeOffentligAFP: boolean | null
  loependeLivsvarigAfpOffentlig?: AfpOffentligLivsvarig
}

export const afpContentIntl = (intl: IntlShape) => ({
  offentligIkkeBeregnet_1: {
    title: `${getOffentligMessage(intl)} (${getIkkeBeregnetMessage(intl)})`,
    content: 'grunnlag.afp.ingress.ja_offentlig_utilgjengelig',
  },

  afpOffentligOppgitt_2: {
    title: `${getOffentligMessage(intl)}`,
    content: 'grunnlag.afp.ingress.ja_offentlig',
  },

  afpOffentligTpo: {
    title: `${getOffentligMessage(intl)} (${getEndringMessage(intl)})`,
    content: 'grunnlag.afp.ingress.ja_offentlig.tpo',
  },

  offentligAfpOgUforeKanIkkeBeregnes_3: {
    title: `${getOffentligMessage(intl)} (${getIkkeBeregnetMessage(intl)})`,
    content: 'grunnlag.afp.ingress.ja_offentlig.ufoeretrygd',
  },

  afpPrivat_4: {
    title: `${getPrivatMessage(intl)}`,
    content: 'grunnlag.afp.ingress.ja_privat',
  },

  afpPrivatIkkeBeregnet_5: {
    title: `${getPrivatMessage(intl)} (${getIkkeBeregnetMessage(intl)})`,
    content: 'grunnlag.afp.ingress.ja_privat.ufoeretrygd',
  },

  afpIkkeSvart_6: {
    title: `${getNeiMessage(intl)}`,
    content: 'grunnlag.afp.ingress.nei',
  },

  afpVetIkke_7: {
    title: `${getVetIkkeMessage(intl)}`,
    content: 'grunnlag.afp.ingress.vet_ikke',
  },

  afpVetIkkeUforetrygd_8: {
    title: `${getVetIkkeMessage(intl)}`,
    content: 'grunnlag.afp.ingress.vet_ikke.ufoeretrygd',
  },

  afpUforetrygd_9: {
    title: `${getNeiMessage(intl)}`,
    content: 'grunnlag.afp.ingress.overgangskull.ufoeretrygd_eller_ap',
  },

  afpUforetrygdNei_10: {
    title: `${getNeiMessage(intl)}`,
    content: 'grunnlag.afp.ingress.ufoeretrygd',
  },
  afpPrivatUendret_11: {
    title: `${getPrivatMessage(intl)} (${getEndringMessage(intl)})`,
    content: 'grunnlag.afp.ingress.ja_privat.endring',
  },
  harAfpOffentlig_12: {
    title: `${getOffentligMessage(intl)}`,
    content: 'grunnlag.afp.ingress.overgangskull',
  },
})

export const generateAfpContent =
  (intl: IntlShape) => (input: IAfpGrunnlagInput) => {
    const content = afpContentIntl(intl)
    const {
      afpValg,
      samtykkeOffentligAFP,
      afpUtregning,
      foedselsdato,
      loependeVedtak,
      beregningsvalg,
      erApoteker,
      loependeLivsvarigAfpOffentlig,
    } = input

    const hasUfoeregradGreaterThanZero = loependeVedtak?.ufoeretrygd?.grad > 0
    const has100PercentUfoeretrygd = loependeVedtak?.ufoeretrygd?.grad === 100
    const hasLoependeVedtak = loependeVedtak?.harLoependeVedtak === true
    const isKap19 = isFoedtFoer1963(foedselsdato)
    const hasAfpPrivat = loependeVedtak?.afpPrivat !== undefined
    const hasAfpOffentlig =
      loependeVedtak?.afpOffentlig !== undefined ||
      loependeVedtak?.pre2025OffentligAfp !== undefined
    const hasAlderspensjon = loependeVedtak?.alderspensjon !== undefined
    const hasFremtidigAlderspensjon =
      loependeVedtak?.fremtidigAlderspensjon !== undefined
    const isAfpValgMissing = afpValg === null || afpValg === undefined

    // Personer født før 1963 eller apotekere behandles likt for AFP-formål
    const isKap19OrApoteker = isKap19 || erApoteker

    // Prioritet 1: Håndter eksisterende AFP-vedtak
    if (hasAfpOffentlig) {
      return content.harAfpOffentlig_12
    }
    if (
      loependeLivsvarigAfpOffentlig?.afpStatus &&
      loependeLivsvarigAfpOffentlig?.maanedligBeloep !== 0 &&
      samtykkeOffentligAFP
    ) {
      return content.afpOffentligTpo
    }
    if (hasAfpPrivat) {
      return content.afpPrivatUendret_11
    }

    // Prioritet 2: Håndter spesielle regler for apotekere og personer født før 1963
    if (isKap19OrApoteker) {
      // Offentlig AFP med KUN_ALDERSPENSJON
      if (afpValg === 'ja_offentlig' && afpUtregning === 'KUN_ALDERSPENSJON') {
        return content.afpIkkeSvart_6
      }

      // Manglende afpValg med vedtak om alderspensjon, fremtidig alderspensjon eller uføretrygd
      if (
        afpValg === null &&
        (hasAlderspensjon ||
          hasFremtidigAlderspensjon ||
          hasUfoeregradGreaterThanZero)
      ) {
        return content.afpUforetrygd_9
      }
    }

    // Prioritet 3: Håndter tilfeller med uføretrygd
    if (hasUfoeregradGreaterThanZero) {
      // Tilfelle 3.1: Født før 1963 eller apoteker med manglende AFP-valg
      if (isKap19OrApoteker && isAfpValgMissing) {
        return content.afpUforetrygd_9
      }

      // Tilfelle 3.2: Personer som verken er født før 1963 eller er apoteker, med uføretrygd
      if (!isKap19OrApoteker) {
        // Håndter ulike AFP-valg med uføretrygd
        switch (afpValg) {
          case 'ja_offentlig': {
            // Manglende samtykke til AFP-beregning (prioriteres høyest)
            if (samtykkeOffentligAFP === false) {
              return content.offentligIkkeBeregnet_1
            }

            if (beregningsvalg === 'uten_afp' || beregningsvalg === null) {
              return content.offentligAfpOgUforeKanIkkeBeregnes_3
            }

            return content.afpOffentligOppgitt_2
          }

          case 'ja_privat': {
            if (beregningsvalg === 'uten_afp' || beregningsvalg === null) {
              return content.afpPrivatIkkeBeregnet_5
            }
            return content.afpPrivat_4
          }

          case 'nei': {
            // Spesialtilfelle for gradert vedtak uten 100% uføregrad
            if (!has100PercentUfoeretrygd && !isKap19) {
              return content.afpIkkeSvart_6
            }
            return content.afpUforetrygdNei_10
          }

          case 'vet_ikke': {
            return content.afpVetIkkeUforetrygd_8
          }

          default: {
            // Tilfelle for null/undefined - alltid return content.afpUforetrygdNei_10
            return content.afpUforetrygdNei_10
          }
        }
      }
    }

    // Prioritet 4: Håndter AFP-valg basert på forskjellige betingelser (for tilfeller uten uføretrygd)
    switch (afpValg) {
      case 'ja_offentlig': {
        // Tilfelle 4.1: Født 1963 eller senere (og ikke apoteker) med offentlig AFP
        if (!isKap19OrApoteker) {
          // Manglende samtykke til AFP-beregning
          if (samtykkeOffentligAFP === false) {
            return content.offentligIkkeBeregnet_1
          }

          // Samtykket til AFP-beregning
          return content.afpOffentligOppgitt_2
        }

        // Tilfelle 4.2: Født før 1963 eller apoteker med offentlig AFP (isKap19OrApoteker)
        if (afpUtregning === 'KUN_ALDERSPENSJON') {
          return content.afpIkkeSvart_6
        }

        if (hasLoependeVedtak && hasUfoeregradGreaterThanZero) {
          return content.harAfpOffentlig_12
        }

        return content.afpOffentligOppgitt_2
      }

      case 'ja_privat': {
        // Tilfelle 4.3: Privat AFP (standardrespons)
        return content.afpPrivat_4
      }

      case 'nei': {
        // Tilfelle 4.4: Ingen AFP
        return content.afpIkkeSvart_6
      }

      case 'vet_ikke':
      default: {
        // Tilfelle 4.5: "Vet ikke"
        return content.afpVetIkke_7
      }
    }
  }
