import clsx from 'clsx'
import Highcharts, { SeriesColumnOptions, XAxisOptions } from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useEffect, useRef, useState } from 'react'
import { FormattedMessage } from 'react-intl'

import { HandFingerIcon } from '@navikt/aksel-icons'
import { BodyLong, BodyShort, Heading, HeadingProps } from '@navikt/ds-react'

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
  selectFoedselsdato,
  selectIsEndring,
  selectSamtykke,
  selectSamtykkeOffentligAFP,
  selectSivilstand,
  selectSkalBeregneAfpKap19,
  selectUfoeregrad,
} from '@/state/userInput/selectors'
import { isAlderOver62 } from '@/utils/alder'

import { MaanedsbeloepAvansertBeregning } from './MaanedsbeloepAvansertBeregning'
import { SimuleringAfpOffentligAlert } from './SimuleringAfpOffentligAlert/SimuleringAfpOffentligAlert'
import { SimuleringEndringBanner } from './SimuleringEndringBanner/SimuleringEndringBanner'
import { SimuleringGrafNavigation } from './SimuleringGrafNavigation/SimuleringGrafNavigation'
import { SimuleringPensjonsavtalerAlert } from './SimuleringPensjonsavtalerAlert/SimuleringPensjonsavtalerAlert'
import { useOffentligTpData, useSimuleringChartLocalState } from './hooks'

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

  const { uttaksalder, aarligInntektVsaHelPensjon, gradertUttaksperiode } =
    useAppSelector(selectCurrentSimulation)
  const skalBeregneAfpKap19 = useAppSelector(selectSkalBeregneAfpKap19)
  const chartRef = useRef<HighchartsReact.RefObject>(null)

  const [pensjonsavtalerRequestBody, setPensjonsavtalerRequestBody] = useState<
    PensjonsavtalerRequestBody | undefined
  >(undefined)

  const {
    data: offentligTp,
    isLoading: isOffentligTpLoading,
    isError: isOffentligTpError,
    afpPerioder,
    erOffentligTpFoer1963,
    tpAfpPeriode,
    erSpkBesteberegning,
  } = useOffentligTpData()

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
  }, [harSamtykket, uttaksalder])

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
    afpPerioderFom65aar: afpPerioder,
    loependeLivsvarigAfpOffentlig,
    pensjonsavtaler: {
      isLoading: isPensjonsavtalerLoading,
      data: pensjonsavtalerData,
    },
    offentligTp: {
      isLoading: isOffentligTpLoading,
      data: offentligTp,
    },
  })

  usePdfView({
    headingLevel,
    alderspensjonListe,
    pre2025OffentligAfp,
    afpPrivatListe,
    afpOffentligListe,
    detaljer,
    visning,
    chartOptions,
    pensjonsavtalerData,
    isPensjonsavtalerSuccess,
    isPensjonsavtalerError,
    isLoading: isLoading || isOffentligTpLoading || isPensjonsavtalerLoading,
    isPensjonsavtaleFlagVisible,
    erOffentligTpFoer1963,
    tpAfpPeriode,
    erSpkBesteberegning,
  })

  const isEnkel = visning === 'enkel'

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
          <HighchartsReact
            ref={chartRef}
            highcharts={Highcharts}
            options={chartOptions}
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
