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
} from '@/utils/alder'

import {
  hentSumOffentligTjenestepensjonVedUttak,
  hentSumPensjonsavtalerVedUttak,
} from './utils'

export interface Pensjonsdata {
  alder: Alder
  grad: number
  afp: number | undefined
  pensjonsavtale: number
  alderspensjon: number | undefined
  pre2025OffentligAfp?: number
  uttaksgrad?: 'helt' | 'gradert'
}

interface PensjonBeregningerProps {
  afpPrivatListe?: AfpPensjonsberegning[]
  afpOffentligListe?: AfpPensjonsberegning[]
  pre2025OffentligAfp?: AfpEtterfulgtAvAlderspensjon
  alderspensjonMaanedligVedEndring?: AlderspensjonMaanedligVedEndring
  pensjonsavtaler?: Pensjonsavtale[]
  simulertTjenestepensjon?: SimulertTjenestepensjon
}

export const usePensjonBeregninger = ({
  alderspensjonMaanedligVedEndring,
  afpPrivatListe,
  afpOffentligListe,
  pre2025OffentligAfp,
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

  const afpVedUttak = (
    ordning: 'offentlig' | 'privat',
    alder?: Alder
  ): number | undefined => {
    const liste = ordning === 'offentlig' ? afpOffentligListe : afpPrivatListe
    if (!liste?.length || !alder) return undefined

    return liste.findLast((utbetaling) => alder.aar >= utbetaling.alder)
      ?.maanedligBeloep
  }

  const summerYtelser = (data: Pensjonsdata): number => {
    return (
      (data.pensjonsavtale || 0) +
      (data.afp || 0) +
      (data.alderspensjon || 0) +
      (data.uttaksgrad === 'gradert' ? data.pre2025OffentligAfp || 0 : 0)
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
        afpVedUttak('offentlig', uttaksalder) ||
        afpVedUttak('privat', uttaksalder),
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
