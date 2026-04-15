import { format } from 'date-fns'
import { enGB, nb, nn } from 'date-fns/locale'

import { getSelectedLanguage } from '@/context/LanguageProvider/utils'
import { useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectFoedselsdato,
} from '@/state/userInput/selectors'
import {
  UTTAKSALDER_FOR_AP_VED_PRE2025_OFFENTLIG_AFP,
  calculateUttaksalderAsDate,
  isAlderLikEllerOverAnnenAlder,
  isAlderOverAnnenAlder,
} from '@/utils/alder'

import {
  hentSumOffentligTjenestepensjonVedUttak,
  hentSumPensjonsavtalerVedUttak,
} from './utils'

export interface Pensjonsdata {
  alder: Alder
  grad: number
  afp: number | null | undefined
  pensjonsavtale: number
  alderspensjon: number | null | undefined
  pre2025OffentligAfp?: number | null
  uttaksgrad?: 'helt' | 'gradert'
}

type AfpVedUttak = {
  alder: number
  maanedligBeloep?: number | null
}

interface PensjonBeregningerProps {
  afpPrivatListe?: AfpVedUttak[] | null
  afpOffentligListe?: AfpVedUttak[] | null
  pre2025OffentligAfp?: AfpEtterfulgtAvAlderspensjon | null
  alderspensjonMaanedligVedEndring?: AlderspensjonMaanedligVedEndring | null
  offentligAfpFraTpOrdning?: UtbetalingsperiodeFoer1963[] | null
  pensjonsavtaler?: Pensjonsavtale[] | null
  simulertTjenestepensjon?: SimulertTjenestepensjon | null
}

export const usePensjonBeregninger = ({
  alderspensjonMaanedligVedEndring,
  afpPrivatListe,
  afpOffentligListe,
  pre2025OffentligAfp,
  offentligAfpFraTpOrdning,
  pensjonsavtaler,
  simulertTjenestepensjon,
}: PensjonBeregningerProps) => {
  const { uttaksalder, gradertUttaksperiode } = useAppSelector(
    selectCurrentSimulation
  )
  const foedselsdato = useAppSelector(selectFoedselsdato)
  const sumPensjonsavtaler = (alder?: Alder): number => {
    if (!pensjonsavtaler || !alder) return 0
    return hentSumPensjonsavtalerVedUttak(pensjonsavtaler, alder)
  }

  const sumTjenestepensjon = (alder?: Alder): number => {
    if (!simulertTjenestepensjon || !alder) return 0
    return hentSumOffentligTjenestepensjonVedUttak(
      simulertTjenestepensjon,
      alder
    )
  }

  const foersteUttaksalder = gradertUttaksperiode?.uttaksalder ?? uttaksalder

  const afpVedUttak = (
    ordning: 'offentlig' | 'privat',
    alder?: Alder
  ): number | null | undefined => {
    // afpPerioder (offentligAfpFraTpOrdning) er kun defined når besteberegnet fra SPK
    if (
      ordning === 'offentlig' &&
      offentligAfpFraTpOrdning?.length &&
      alder &&
      foersteUttaksalder &&
      foersteUttaksalder.aar >= 65
    ) {
      const matchingPeriode = offentligAfpFraTpOrdning.find(
        (p) =>
          isAlderLikEllerOverAnnenAlder(alder, p.startAlder) &&
          !isAlderOverAnnenAlder(
            alder,
            p.sluttAlder ?? UTTAKSALDER_FOR_AP_VED_PRE2025_OFFENTLIG_AFP
          )
      )
      if (matchingPeriode) {
        return Math.round(matchingPeriode.aarligUtbetaling / 12)
      }
    }

    const liste = ordning === 'offentlig' ? afpOffentligListe : afpPrivatListe
    if (!liste?.length || !alder) return undefined

    return liste.findLast((utbetaling) => alder.aar >= utbetaling.alder)
      ?.maanedligBeloep
  }

  const summerYtelser = (data: Pensjonsdata): number => {
    const afpBeloep = data.afp || 0
    const pre2025Afp =
      data.uttaksgrad === 'gradert' && !data.afp
        ? data.pre2025OffentligAfp || 0
        : 0
    return (
      (data.pensjonsavtale || 0) +
      afpBeloep +
      (data.alderspensjon || 0) +
      pre2025Afp
    )
  }

  const hentUttaksmaanedOgAar = (uttak: Alder) => {
    const date = calculateUttaksalderAsDate(uttak, foedselsdato!)
    const language = getSelectedLanguage()
    const locale = language === 'en' ? enGB : language === 'nn' ? nn : nb

    return format(date, 'LLLL yyyy', { locale })
  }

  // Lager pensjonsdata for gradering og uttaksalder
  const pensjonsdata: Pensjonsdata[] = []

  if (gradertUttaksperiode) {
    const gradertAlder = gradertUttaksperiode.uttaksalder
    pensjonsdata.push({
      alder: gradertAlder,
      grad: gradertUttaksperiode.grad,
      afp:
        afpVedUttak('offentlig', gradertAlder) ||
        afpVedUttak('privat', gradertAlder),
      pensjonsavtale:
        sumPensjonsavtaler(gradertAlder) + sumTjenestepensjon(gradertAlder),
      alderspensjon:
        alderspensjonMaanedligVedEndring?.gradertUttakMaanedligBeloep,
      pre2025OffentligAfp: pre2025OffentligAfp?.totaltAfpBeloep,
      uttaksgrad: 'gradert',
    })
  }

  if (uttaksalder) {
    // Kalkuler maaned for uttaksalder basert på fødselsdato for pre2025OffentligAfp
    const foedselsdatoMonth = foedselsdato
      ? new Date(foedselsdato).getMonth() - 1
      : 0

    const pensjonsDataAlder = pre2025OffentligAfp
      ? {
          ...UTTAKSALDER_FOR_AP_VED_PRE2025_OFFENTLIG_AFP,
          maaneder: foedselsdatoMonth,
        }
      : uttaksalder

    pensjonsdata.push({
      alder: pensjonsDataAlder,
      grad: 100,
      afp:
        afpVedUttak('offentlig', pensjonsDataAlder) ||
        afpVedUttak('privat', pensjonsDataAlder),
      pensjonsavtale:
        sumPensjonsavtaler(
          pre2025OffentligAfp
            ? UTTAKSALDER_FOR_AP_VED_PRE2025_OFFENTLIG_AFP
            : uttaksalder
        ) +
        sumTjenestepensjon(
          pre2025OffentligAfp
            ? UTTAKSALDER_FOR_AP_VED_PRE2025_OFFENTLIG_AFP
            : uttaksalder
        ),
      alderspensjon: alderspensjonMaanedligVedEndring?.heltUttakMaanedligBeloep,
      pre2025OffentligAfp: pre2025OffentligAfp?.totaltAfpBeloep,
      uttaksgrad: 'helt',
    })
  }

  return {
    pensjonsdata,
    summerYtelser,
    hentUttaksmaanedOgAar,
    harGradering: !!gradertUttaksperiode,
    uttaksalder,
  }
}
