import clsx from 'clsx'
import type { SeriesColumnOptions, SeriesOptionsType } from 'highcharts'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { HandFingerIcon } from '@navikt/aksel-icons'
import type { HeadingProps } from '@navikt/ds-react'
import { BodyLong, BodyShort, Heading } from '@navikt/ds-react'

import { TabellVisning } from '@/components/TabellVisning'
import { usePdfView } from '@/pdf-view/hooks'
import {
  useGetAfpOffentligLivsvarigQuery,
  usePensjonsavtalerQuery,
} from '@/state/api/apiSlice'
import { isOffentligTpFoer1963 } from '@/state/api/typeguards'
import { generatePensjonsavtalerRequestBody } from '@/state/api/utils'
import { useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectCurrentSimulation,
  selectEpsHarInntektOver2G,
  selectEpsHarPensjon,
  selectErApoteker,
  selectFoedselsdato,
  selectIsEndring,
  selectSamtykke,
  selectSamtykkeOffentligAFP,
  selectSivilstand,
  selectSkalBeregneAfpKap19,
  selectUfoeregrad,
  selectUtenlandsperioder,
} from '@/state/userInput/selectors'
import { isAlderOver62 } from '@/utils/alder'
import { formatInntektToNumber } from '@/utils/inntekt'

import { Graph } from './Graph'
import { MaanedsbeloepAvansertBeregning } from './MaanedsbeloepAvansertBeregning'
import { SimuleringAfpOffentligAlert } from './SimuleringAfpOffentligAlert/SimuleringAfpOffentligAlert'
import { SimuleringEndringBanner } from './SimuleringEndringBanner/SimuleringEndringBanner'
import { SimuleringGrafNavigation } from './SimuleringGrafNavigation/SimuleringGrafNavigation'
import { SimuleringPensjonsavtalerAlert } from './SimuleringPensjonsavtalerAlert/SimuleringPensjonsavtalerAlert'
import { SERIES_DEFAULT } from './constants'
import { type SeriesConfig } from './data/data'
import {
  buildAfpSerie,
  buildAlderspensjonSerie,
  buildInntektSerie,
  buildTpSerie,
} from './data/series-builders'
import { useOffentligTpData } from './hooks'

import styles from './Simulering.module.scss'

interface Props {
  isLoading: boolean
  headingLevel: HeadingProps['level']
  aarligInntektFoerUttakBeloep: string
  alderspensjonListe?: AlderspensjonPensjonsberegning[]
  afpPrivatListe?: AfpPrivatPensjonsberegning[]
  pre2025OffentligAfp?: AfpEtterfulgtAvAlderspensjon
  afpOffentligListe?: AfpPensjonsberegning[]
  alderspensjonMaanedligVedEndring?: AlderspensjonMaanedligVedEndring
  showButtonsAndTable?: boolean
  detaljer?: {
    trygdetid?: number
    opptjeningsgrunnlag?: SimulertOpptjeningGrunnlag[]
    harForLiteTrygdetid?: boolean
  }
  visning?: BeregningVisning
}

export const Simulering = ({
  isLoading,
  headingLevel,
  aarligInntektFoerUttakBeloep,
  alderspensjonListe,
  pre2025OffentligAfp,
  afpPrivatListe,
  afpOffentligListe,
  alderspensjonMaanedligVedEndring,
  detaljer,
  showButtonsAndTable,
  visning,
}: Props) => {
  const harSamtykket = useAppSelector(selectSamtykke)
  const ufoeregrad = useAppSelector(selectUfoeregrad)
  const afp = useAppSelector(selectAfp)
  const sivilstand = useAppSelector(selectSivilstand)
  const foedselsdato = useAppSelector(selectFoedselsdato)
  const isEndring = useAppSelector(selectIsEndring)
  const epsHarPensjon = useAppSelector(selectEpsHarPensjon)
  const epsHarInntektOver2G = useAppSelector(selectEpsHarInntektOver2G)
  const erApoteker = useAppSelector(selectErApoteker)
  const { uttaksalder, aarligInntektVsaHelPensjon, gradertUttaksperiode } =
    useAppSelector(selectCurrentSimulation)
  const skalBeregneAfpKap19 = useAppSelector(selectSkalBeregneAfpKap19)
  const intl = useIntl()

  const utenlandsperioder = useAppSelector(selectUtenlandsperioder)

  const [pensjonsavtalerRequestBody, setPensjonsavtalerRequestBody] = useState<
    PensjonsavtalerRequestBody | undefined
  >(undefined)

  const {
    data: offentligTp,
    isFetching: isOffentligTpLoading,
    isError: isOffentligTpError,
    afpPerioder,
    tpAfpPeriode,
    erOffentligTpFoer1963,
    erSpkBesteberegning,
  } = useOffentligTpData()

  console.log('test - Simulering render')

  const {
    data: pensjonsavtalerData,
    isFetching: isPensjonsavtalerLoading,
    isSuccess: isPensjonsavtalerSuccess,
    isError: isPensjonsavtalerError,
  } = usePensjonsavtalerQuery(
    pensjonsavtalerRequestBody as PensjonsavtalerRequestBody,
    {
      skip: !pensjonsavtalerRequestBody || !harSamtykket || !uttaksalder,
    }
  )

  const harSamtykketOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const {
    isSuccess: isAfpOffentligLivsvarigSuccess,
    data: loependeLivsvarigAfpOffentlig,
  } = useGetAfpOffentligLivsvarigQuery(undefined, {
    skip:
      !harSamtykketOffentligAFP ||
      !foedselsdato ||
      !isAlderOver62(foedselsdato),
  })

  const shouldShowAfpOffentlig =
    !loependeLivsvarigAfpOffentlig ||
    loependeLivsvarigAfpOffentlig.afpStatus === false ||
    (loependeLivsvarigAfpOffentlig.afpStatus === true &&
      loependeLivsvarigAfpOffentlig.maanedligBeloep === 0) ||
    (loependeLivsvarigAfpOffentlig.afpStatus == null &&
      loependeLivsvarigAfpOffentlig.maanedligBeloep == null)

  // Calculate the start age for the x-axis
  // If gradual withdrawal exists, start from the year before; otherwise use standard logic

  const hasPensjonsgivendeInntekt = useMemo(() => {
    return Boolean(
      (aarligInntektFoerUttakBeloep &&
        formatInntektToNumber(aarligInntektFoerUttakBeloep) > 0) ||
      (gradertUttaksperiode?.aarligInntektVsaPensjonBeloep &&
        formatInntektToNumber(
          gradertUttaksperiode.aarligInntektVsaPensjonBeloep
        ) > 0) ||
      (aarligInntektVsaHelPensjon?.beloep &&
        formatInntektToNumber(aarligInntektVsaHelPensjon.beloep) > 0)
    )
  }, [
    aarligInntektFoerUttakBeloep,
    gradertUttaksperiode?.aarligInntektVsaPensjonBeloep,
    aarligInntektVsaHelPensjon?.beloep,
  ])

  const graphData: SeriesConfig[] = useMemo(
    () => [
      {
        name: intl.formatMessage({ id: SERIES_DEFAULT.SERIE_INNTEKT.name }),
        color: SERIES_DEFAULT.SERIE_INNTEKT.color,
        showInLegend: hasPensjonsgivendeInntekt,
        data: buildInntektSerie({
          uttaksalder,
          isEndring,
          alderspensjonListe,
          gradertUttaksperiode,
          aarligInntektFoerUttakBeloep,
          aarligInntektVsaHelPensjon,
          pre2025OffentligAfp,
        }),
      },
      {
        name: intl.formatMessage({ id: SERIES_DEFAULT.SERIE_AFP.name }),
        color: SERIES_DEFAULT.SERIE_AFP.color,
        data: buildAfpSerie({
          pre2025OffentligAfp,
          afpPerioder,
          uttaksalder,
          shouldShowAfpOffentlig,
          afpOffentligListe,
          afpPrivatListe,
        }),
      },
      {
        name: intl.formatMessage({ id: SERIES_DEFAULT.SERIE_TP.name }),
        color: SERIES_DEFAULT.SERIE_TP.color,
        data: buildTpSerie({
          pensjonsavtaler: pensjonsavtalerData?.avtaler,
          offentligTpUtbetalingsperioder:
            offentligTp?.simulertTjenestepensjon?.simuleringsresultat
              .utbetalingsperioder,
          uttaksalder: uttaksalder ?? undefined,
        }),
      },
      {
        name: intl.formatMessage({
          id: SERIES_DEFAULT.SERIE_ALDERSPENSJON.name,
        }),
        color: SERIES_DEFAULT.SERIE_ALDERSPENSJON.color,
        data: buildAlderspensjonSerie({ alderspensjonListe }),
      },
    ],
    [
      intl,
      hasPensjonsgivendeInntekt,
      isEndring,
      uttaksalder,
      gradertUttaksperiode,
      aarligInntektFoerUttakBeloep,
      aarligInntektVsaHelPensjon,
      alderspensjonListe,
      pre2025OffentligAfp,
      shouldShowAfpOffentlig,
      afpOffentligListe,
      afpPrivatListe,
      afpPerioder,
      pensjonsavtalerData?.avtaler,
      offentligTp?.simulertTjenestepensjon?.simuleringsresultat
        .utbetalingsperioder,
    ]
  )

  useEffect(() => {
    if (harSamtykket && uttaksalder) {
      setPensjonsavtalerRequestBody(
        generatePensjonsavtalerRequestBody({
          ufoeregrad,
          afp,
          sivilstand,
          epsHarPensjon,
          epsHarInntektOver2G,
          aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? '0',
          gradertUttak: gradertUttaksperiode ?? undefined,
          heltUttak: {
            uttaksalder,
            aarligInntektVsaPensjon: aarligInntektVsaHelPensjon,
          },
          skalBeregneAfpKap19,
        })
      )
    }
  }, [
    harSamtykket,
    uttaksalder,
    gradertUttaksperiode,
    aarligInntektFoerUttakBeloep,
    aarligInntektVsaHelPensjon,
    epsHarInntektOver2G,
    utenlandsperioder,
    sivilstand,
    epsHarPensjon,
    afp,
    ufoeregrad,
    erApoteker,
    foedselsdato,
    skalBeregneAfpKap19,
  ])

  const [showVisFaerreAarButton, setShowVisFaerreAarButton] = useState(false)
  const [showVisFlereAarButton, setShowVisFlereAarButton] = useState(false)
  const [tableXAxis, setTableXAxis] = useState<string[]>([])
  const [tableSeries, setTableSeries] = useState<SeriesOptionsType[]>([])

  const handleButtonVisibilityChange = useCallback(
    (state: {
      showVisFaerreAarButton: boolean
      showVisFlereAarButton: boolean
    }) => {
      setShowVisFaerreAarButton(state.showVisFaerreAarButton)
      setShowVisFlereAarButton(state.showVisFlereAarButton)
    },
    []
  )

  const handleSeriesDataChange = useCallback(
    (xAxis: string[], series: SeriesOptionsType[]) => {
      setTableXAxis(xAxis)
      setTableSeries(series)
    },
    []
  )

  const filteredTableSeries = useMemo(() => {
    if (hasPensjonsgivendeInntekt) return tableSeries as SeriesColumnOptions[]

    return tableSeries.filter(
      (serie) =>
        serie.name !==
        intl.formatMessage({ id: SERIES_DEFAULT.SERIE_INNTEKT.name })
    ) as SeriesColumnOptions[]
  }, [tableSeries, hasPensjonsgivendeInntekt, intl])

  const isPensjonsavtaleFlagVisible = useMemo(() => {
    if (!uttaksalder) return false

    const avtaler = pensjonsavtalerData?.avtaler ?? []
    const utbetalingsperioder =
      offentligTp?.simulertTjenestepensjon?.simuleringsresultat
        .utbetalingsperioder ?? []

    const startAlder = gradertUttaksperiode?.uttaksalder || uttaksalder

    return (
      avtaler.some((avtale) => avtale.startAar < startAlder.aar) ||
      utbetalingsperioder.some(
        (periode) => periode.startAlder.aar < startAlder.aar
      )
    )
  }, [
    pensjonsavtalerData?.avtaler,
    offentligTp?.simulertTjenestepensjon?.simuleringsresultat
      .utbetalingsperioder,
    uttaksalder?.aar,
    gradertUttaksperiode?.uttaksalder,
  ])

  // const { data: person } = useGetPersonQuery()
  const isEnkel = visning === 'enkel'

  usePdfView({
    headingLevel,
    alderspensjonListe,
    pre2025OffentligAfp,
    afpPrivatListe,
    afpOffentligListe,
    detaljer,
    visning,
    series: filteredTableSeries,
    aarArray: tableXAxis,
    pensjonsavtalerData,
    isPensjonsavtalerSuccess,
    isPensjonsavtalerError,
    isLoading: isLoading || isOffentligTpLoading || isPensjonsavtalerLoading,
    isPensjonsavtaleFlagVisible,
    erOffentligTpFoer1963,
    tpAfpPeriode,
    erSpkBesteberegning,
  })

  const hideAFP =
    loependeLivsvarigAfpOffentlig?.afpStatus &&
    (loependeLivsvarigAfpOffentlig?.maanedligBeloep === null ||
      loependeLivsvarigAfpOffentlig?.maanedligBeloep === undefined)

  return (
    <section className={styles.section}>
      {!isEndring && (
        <div className={clsx({ [styles.intro]: isEnkel })}>
          <Heading
            className={clsx({ [styles.introTitle]: isEnkel })}
            level={headingLevel}
            size={headingLevel === '2' ? 'medium' : 'small'}
            data-testid="beregning-title"
          >
            <FormattedMessage id="beregning.highcharts.title" />
          </Heading>

          {isEnkel && (
            <BodyLong>
              <FormattedMessage id="beregning.highcharts.ingress" />
            </BodyLong>
          )}
        </div>
      )}

      {showButtonsAndTable && (
        <SimuleringEndringBanner
          isLoading={isLoading}
          heltUttaksalder={uttaksalder}
          gradertUttaksperiode={gradertUttaksperiode ?? undefined}
          alderspensjonMaanedligVedEndring={alderspensjonMaanedligVedEndring}
        />
      )}

      <div role="img" aria-labelledby="alt-chart-title">
        <div id="alt-chart-title" hidden>
          <FormattedMessage id="beregning.highcharts.alt_tekst" />
        </div>

        <div
          className={styles.highchartsWrapper}
          data-testid="highcharts-aria-wrapper"
          aria-hidden={true}
        >
          <Graph
            data={graphData}
            isLoading={isLoading}
            isPensjonsavtalerLoading={isPensjonsavtalerLoading}
            isOffentligTpLoading={isOffentligTpLoading}
            skalBeregneAfpKap19={skalBeregneAfpKap19 ?? false}
            onButtonVisibilityChange={handleButtonVisibilityChange}
            onSeriesDataChange={handleSeriesDataChange}
          />

          {showButtonsAndTable && (
            <BodyShort
              size="small"
              textColor="subtle"
              className={styles.infoClick}
            >
              <HandFingerIcon />
              <FormattedMessage id="beregning.highcharts.informasjon_klikk" />
            </BodyShort>
          )}
        </div>
      </div>

      {showButtonsAndTable && (
        <SimuleringGrafNavigation
          showVisFaerreAarButton={showVisFaerreAarButton}
          showVisFlereAarButton={showVisFlereAarButton}
        />
      )}

      <SimuleringPensjonsavtalerAlert
        isPensjonsavtaleFlagVisible={isPensjonsavtaleFlagVisible}
        pensjonsavtaler={{
          isLoading: isPensjonsavtalerLoading,
          isError: isPensjonsavtalerError,
          isSuccess: isPensjonsavtalerSuccess,
          data: pensjonsavtalerData,
        }}
        offentligTp={{
          isError: isOffentligTpError,
          data: offentligTp,
        }}
        erOffentligTpFoer1963={erOffentligTpFoer1963}
      />

      <SimuleringAfpOffentligAlert
        harSamtykketOffentligAFP={harSamtykketOffentligAFP}
        isAfpOffentligLivsvarigSuccess={isAfpOffentligLivsvarigSuccess}
        loependeLivsvarigAfpOffentlig={loependeLivsvarigAfpOffentlig}
      />

      {showButtonsAndTable && (
        <TabellVisning
          series={filteredTableSeries}
          aarArray={tableXAxis}
          skalBeregneAfpKap19={skalBeregneAfpKap19 ?? false}
        />
      )}

      {/* c8 ignore next 6 - detaljer skal kun vises i dev for test formål */}
      {/* {utvidetSimuleringsresultatFeatureToggle?.enabled && detaljer && (
        <Simuleringsdetaljer
          alderspensjonListe={alderspensjonListe}
          detaljer={detaljer}
          pre2025OffentligAfp={pre2025OffentligAfp}
        />
      )} */}

      {!isOffentligTpLoading &&
        !isLoading &&
        !isPensjonsavtalerLoading &&
        !isEndring &&
        visning === 'avansert' && (
          <MaanedsbeloepAvansertBeregning
            alderspensjonMaanedligVedEndring={alderspensjonMaanedligVedEndring}
            afpPrivatListe={afpPrivatListe}
            afpOffentligListe={hideAFP ? undefined : afpOffentligListe}
            pre2025OffentligAfp={pre2025OffentligAfp}
            offentligAfpFraTpOrdning={afpPerioder}
            pensjonsavtaler={pensjonsavtalerData?.avtaler}
            simulertTjenestepensjon={offentligTp?.simulertTjenestepensjon}
            erTpFoer1963={
              offentligTp &&
              erOffentligTpFoer1963 &&
              isOffentligTpFoer1963(offentligTp) &&
              (skalBeregneAfpKap19 ?? false)
            }
            skalViseNullOffentligTjenestepensjon={
              isOffentligTpFoer1963(offentligTp) &&
              offentligTp?.feilkode === 'BEREGNING_GIR_NULL_UTBETALING'
            }
          />
        )}
    </section>
  )
}
