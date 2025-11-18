import clsx from 'clsx'
import type { SeriesColumnOptions, XAxisOptions } from 'highcharts'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useEffect, useRef, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { HandFingerIcon } from '@navikt/aksel-icons'
import type { HeadingProps } from '@navikt/ds-react'
import { BodyLong, BodyShort, Heading } from '@navikt/ds-react'

import { TabellVisning } from '@/components/TabellVisning'
import {
  useOffentligTpQuery,
  usePensjonsavtalerQuery,
} from '@/state/api/apiSlice'
import {
  generateOffentligTpRequestBody,
  generatePensjonsavtalerRequestBody,
} from '@/state/api/utils'
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
  selectSivilstand,
  selectSkalBeregneAfpKap19,
  selectUfoeregrad,
  selectUtenlandsperioder,
} from '@/state/userInput/selectors'
import { formatInntektToNumber } from '@/utils/inntekt'

import Graph from './Graph/Graph'
import { MaanedsbeloepAvansertBeregning } from './MaanedsbeloepAvansertBeregning'
import { SimuleringEndringBanner } from './SimuleringEndringBanner/SimuleringEndringBanner'
import { SimuleringGrafNavigation } from './SimuleringGrafNavigation/SimuleringGrafNavigation'
import { SimuleringPensjonsavtalerAlert } from './SimuleringPensjonsavtalerAlert/SimuleringPensjonsavtalerAlert'
import { SERIES_DEFAULT } from './constants'
import {
  type SeriesConfig,
  mergeAarligUtbetalinger,
  parseStartSluttUtbetaling,
} from './data/data'
import { useSimuleringChartLocalState } from './hooks'

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
  const utenlandsperioder = useAppSelector(selectUtenlandsperioder)
  const { uttaksalder, aarligInntektVsaHelPensjon, gradertUttaksperiode } =
    useAppSelector(selectCurrentSimulation)
  const skalBeregneAfpKap19 = useAppSelector(selectSkalBeregneAfpKap19)
  const chartRef = useRef<HighchartsReact.RefObject>(null)
  const intl = useIntl()

  const [offentligTpRequestBody, setOffentligTpRequestBody] = useState<
    OffentligTpRequestBody | undefined
  >(undefined)

  const [pensjonsavtalerRequestBody, setPensjonsavtalerRequestBody] = useState<
    PensjonsavtalerRequestBody | undefined
  >(undefined)

  const {
    data: offentligTpData,
    isFetching: isOffentligTpLoading,
    isError: isOffentligTpError,
  } = useOffentligTpQuery(offentligTpRequestBody as OffentligTpRequestBody, {
    skip: !offentligTpRequestBody || !harSamtykket || !uttaksalder,
  })

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

  // Find max age across all data sources for extending lifetime payments
  // Only consider actual end dates, not lifetime payments (exclude undefined sluttAlder)
  const maxAgeFromAlderspensjon = alderspensjonListe
    ? Math.max(...alderspensjonListe.map((it) => it.alder))
    : 0
  const maxAgeFromAfpOffentlig = afpOffentligListe?.[0]?.alder ?? 0

  const pensjonsavtalerEndDates = (pensjonsavtalerData?.avtaler ?? []).flatMap(
    (avtale) =>
      avtale.utbetalingsperioder
        .filter((p) => p.sluttAlder !== undefined)
        .map((p) => p.sluttAlder!.aar)
  )

  const offentligTpEndDates = (
    offentligTpData?.simulertTjenestepensjon?.simuleringsresultat
      .utbetalingsperioder ?? []
  )
    .filter((p) => p.sluttAlder !== undefined)
    .map((p) => p.sluttAlder!.aar)

  const maxAgeFromPensjonsavtaler = Math.max(
    ...pensjonsavtalerEndDates,
    ...offentligTpEndDates,
    77 // Default minimum
  )

  const maxAlder = Math.max(
    maxAgeFromAlderspensjon,
    maxAgeFromAfpOffentlig,
    maxAgeFromPensjonsavtaler
  )

  // Calculate the start age for the x-axis (same logic as old implementation)
  const xAxisStartAar = isEndring
    ? (uttaksalder?.aar ?? 67)
    : (uttaksalder?.aar ?? 67) - 1

  const data: SeriesConfig[] = [
    {
      type: 'column',
      name: intl.formatMessage({ id: SERIES_DEFAULT.SERIE_INNTEKT.name }),
      color: SERIES_DEFAULT.SERIE_INNTEKT.color,
      data:
        aarligInntektFoerUttakBeloep &&
        aarligInntektFoerUttakBeloep &&
        uttaksalder &&
        !isEndring // Only show income for førstegangssøknad
          ? parseStartSluttUtbetaling(
              {
                startAlder: {
                  aar: uttaksalder.aar - 1, // Viser full inntekt første år
                  maaneder: 0,
                },
                sluttAlder:
                  uttaksalder.maaneder === 0
                    ? {
                        // Hvis uttak starter i januar (måned 0), slutt inntekt i desember året før
                        aar: uttaksalder.aar - 1,
                        maaneder: 11,
                      }
                    : {
                        // Ellers, slutt inntekt måneden før uttak i samme år
                        aar: uttaksalder.aar,
                        maaneder: uttaksalder.maaneder - 1,
                      },
                aarligUtbetaling: formatInntektToNumber(
                  aarligInntektFoerUttakBeloep // TODO: Må vise livsvarig AFP
                ),
              },
              maxAlder
            ).filter((item) => item.alder >= xAxisStartAar)
          : [],
    },
    {
      type: 'column',
      name: intl.formatMessage({
        id: SERIES_DEFAULT.SERIE_AFP.name,
      }),
      color: SERIES_DEFAULT.SERIE_AFP.color,
      data: mergeAarligUtbetalinger([
        afpOffentligListe
          ? parseStartSluttUtbetaling(
              {
                startAlder: { aar: afpOffentligListe[0].alder, maaneder: 0 },
                aarligUtbetaling: afpOffentligListe[0].beloep,
              },
              maxAlder
            )
          : [],
        afpPrivatListe ? afpPrivatListe : [],
      ]).filter((item) => item.alder >= xAxisStartAar),
    },
    {
      type: 'column',
      name: intl.formatMessage({ id: SERIES_DEFAULT.SERIE_TP.name }),
      color: SERIES_DEFAULT.SERIE_TP.color,
      data: (() => {
        const privatePensjonsParsed = (
          pensjonsavtalerData?.avtaler ?? []
        ).flatMap((avtale) =>
          avtale.utbetalingsperioder.map((periode) =>
            parseStartSluttUtbetaling(
              {
                startAlder: periode.startAlder,
                sluttAlder: periode.sluttAlder,
                aarligUtbetaling: periode.aarligUtbetaling,
              },
              maxAlder
            )
          )
        )

        const offentligTpParsed = (
          offentligTpData?.simulertTjenestepensjon?.simuleringsresultat
            .utbetalingsperioder ?? []
        ).map((periode) =>
          parseStartSluttUtbetaling(
            {
              startAlder: periode.startAlder,
              sluttAlder: periode.sluttAlder,
              aarligUtbetaling: periode.aarligUtbetaling,
            },
            maxAlder
          )
        )

        return mergeAarligUtbetalinger([
          ...privatePensjonsParsed,
          ...offentligTpParsed,
        ]).filter((item) => item.alder >= xAxisStartAar)
      })(),
    },
    {
      type: 'column',
      name: intl.formatMessage({ id: SERIES_DEFAULT.SERIE_ALDERSPENSJON.name }),
      color: SERIES_DEFAULT.SERIE_ALDERSPENSJON.color,
      pointWidth: SERIES_DEFAULT.SERIE_ALDERSPENSJON.pointWidth,
      data: alderspensjonListe
        ? (() => {
            const lastBeloep =
              alderspensjonListe[alderspensjonListe.length - 1].beloep
            const lastAlder =
              alderspensjonListe[alderspensjonListe.length - 1].alder
            const result = alderspensjonListe
              .filter((it) => it.alder >= xAxisStartAar)
              .map((it) => ({
                alder: it.alder,
                beloep: it.beloep,
              }))
            // Alderspensjon fra Nav er livsvarig - extend to maxAlder
            for (let alder = lastAlder + 1; alder <= maxAlder; alder++) {
              result.push({ alder, beloep: lastBeloep })
            }
            return result
          })()
        : [],
    },
  ]

  useEffect(() => {
    if (harSamtykket && uttaksalder) {
      setOffentligTpRequestBody(
        generateOffentligTpRequestBody({
          afp,
          foedselsdato,
          sivilstand,
          epsHarPensjon,
          epsHarInntektOver2G,
          aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? '0',
          gradertUttak: gradertUttaksperiode ?? undefined,
          heltUttak: {
            uttaksalder,
            aarligInntektVsaPensjon: aarligInntektVsaHelPensjon,
          },
          utenlandsperioder,
          erApoteker,
        })
      )

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

  const [
    chartOptions,
    showVisFaerreAarButton,
    showVisFlereAarButton,
    isPensjonsavtaleFlagVisible,
  ] = useSimuleringChartLocalState({
    styles,
    chartRef,
    foedselsdato,
    isEndring,
    uttaksalder,
    gradertUttaksperiode,
    aarligInntektFoerUttakBeloep,
    aarligInntektVsaHelPensjon,
    isLoading,
    alderspensjonListe,
    pre2025OffentligAfp,
    afpPrivatListe,
    afpOffentligListe,
    pensjonsavtaler: {
      isLoading: isPensjonsavtalerLoading,
      data: pensjonsavtalerData,
    },
    offentligTp: {
      isLoading: isOffentligTpLoading,
      data: offentligTpData,
    },
  })

  const isEnkel = visning === 'enkel'

  return (
    <section className={styles.section}>
      {!isEndring && (
        <div className={clsx({ [styles.intro]: isEnkel })}>
          <Heading
            className={clsx({ [styles.introTitle]: isEnkel })}
            level={headingLevel}
            size={headingLevel === '2' ? 'medium' : 'small'}
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
          <HighchartsReact
            ref={chartRef}
            highcharts={Highcharts}
            options={chartOptions}
          />

          <Graph data={data} />

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
          data: offentligTpData,
        }}
      />

      {showButtonsAndTable && (
        <TabellVisning
          series={chartOptions.series as SeriesColumnOptions[]}
          aarArray={(chartOptions?.xAxis as XAxisOptions).categories}
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
            afpOffentligListe={afpOffentligListe}
            pre2025OffentligAfp={pre2025OffentligAfp}
            pensjonsavtaler={pensjonsavtalerData?.avtaler}
            simulertTjenestepensjon={offentligTpData?.simulertTjenestepensjon}
          />
        )}
    </section>
  )
}
