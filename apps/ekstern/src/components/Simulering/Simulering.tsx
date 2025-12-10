import clsx from 'clsx'
import Highcharts, { SeriesColumnOptions, XAxisOptions } from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { HandFingerIcon } from '@navikt/aksel-icons'
import { BodyLong, BodyShort, Heading, HeadingProps } from '@navikt/ds-react'

import { TabellVisning } from '@/components/TabellVisning'
import { BeregningContext } from '@/pages/Beregning/context'
import {
  useGetAfpOffentligLivsvarigQuery,
  useGetOmstillingsstoenadOgGjenlevendeQuery,
  useGetPersonQuery,
  useGetShowDownloadPdfFeatureToggleQuery,
  useOffentligTpQuery,
  usePensjonsavtalerQuery,
} from '@/state/api/apiSlice'
import {
  generateOffentligTpRequestBody,
  generatePensjonsavtalerRequestBody,
} from '@/state/api/utils'
import { useAppSelector } from '@/state/hooks'
import {
  selectAarligInntektFoerUttakBeloepFraSkatt,
  selectAfp,
  selectAfpUtregningValg,
  selectCurrentSimulation,
  selectEpsHarInntektOver2G,
  selectEpsHarPensjon,
  selectErApoteker,
  selectFoedselsdato,
  selectIsEndring,
  selectLoependeVedtak,
  selectSamtykke,
  selectSamtykkeOffentligAFP,
  selectSivilstand,
  selectSkalBeregneAfpKap19,
  selectUfoeregrad,
  selectUtenlandsperioder,
} from '@/state/userInput/selectors'
import { formatUttaksalder, isAlderOver62 } from '@/utils/alder'
import {
  useTidligstMuligUttak,
  useTidligstMuligUttakConditions,
} from '@/utils/hooks/useTidligstMuligUttakData'

import { generateAfpContent } from '../Grunnlag/GrunnlagAFP/utils'
import { useTableData } from '../TabellVisning/hooks'
import { useBeregningsdetaljer } from './BeregningsdetaljerForOvergangskull/hooks'
import { MaanedsbeloepAvansertBeregning } from './MaanedsbeloepAvansertBeregning'
import { SimuleringAfpOffentligAlert } from './SimuleringAfpOffentligAlert/SimuleringAfpOffentligAlert'
import { SimuleringEndringBanner } from './SimuleringEndringBanner/SimuleringEndringBanner'
import { SimuleringGrafNavigation } from './SimuleringGrafNavigation/SimuleringGrafNavigation'
import { SimuleringPensjonsavtalerAlert } from './SimuleringPensjonsavtalerAlert/SimuleringPensjonsavtalerAlert'
import { useSimuleringChartLocalState } from './hooks'
import {
  getChartTable,
  getCurrentDateTimeFormatted,
  getForbeholdAvsnitt,
  getGrunnlagIngress,
  getOmstillingsstoenadAlert,
  getPdfHeadingWithLogo,
  getTidligstMuligUttakIngressContent,
} from './pdf-utils'

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
  const { showPDFRef, setIsPdfReady } = useContext(BeregningContext)
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
  const samtykkeOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const afpUtregningValg = useAppSelector(selectAfpUtregningValg)
  const { beregningsvalg } = useAppSelector(selectCurrentSimulation)

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
  const { data: showPDF } = useGetShowDownloadPdfFeatureToggleQuery()

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
    loependeLivsvarigAfpOffentlig,
    pensjonsavtaler: {
      isLoading: isPensjonsavtalerLoading,
      data: pensjonsavtalerData,
    },
    offentligTp: {
      isLoading: isOffentligTpLoading,
      data: offentligTpData,
    },
  })

  const { data: person } = useGetPersonQuery()
  const isEnkel = visning === 'enkel'
  const series = chartOptions.series as SeriesColumnOptions[]
  const aarArray = (chartOptions?.xAxis as XAxisOptions).categories
  const tableData = useTableData(series, aarArray)
  const loependeVedtak = useAppSelector(selectLoependeVedtak)
  const intl = useIntl()

  const { alderspensjonDetaljerListe, afpDetaljerListe } =
    useBeregningsdetaljer(
      alderspensjonListe,
      afpPrivatListe,
      afpOffentligListe,
      pre2025OffentligAfp,
      loependeLivsvarigAfpOffentlig
    )

  const { data: tidligstMuligUttak } = useTidligstMuligUttak(ufoeregrad)
  const { data: omstillingsstoenadOgGjenlevende } =
    useGetOmstillingsstoenadOgGjenlevendeQuery()
  useEffect(() => {
    window.addEventListener('beforeprint', () => {
      const locationUrl = window.location.href
      if (locationUrl.includes('beregning') && showPDF?.enabled) {
        handlePDF()
      }
    })
    return () => {
      window.removeEventListener('beforeprint', handlePDF)
    }
  })

  const isSafari = (): boolean => {
    return /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent)
  }

  const {
    normertPensjonsalder,
    nedreAldersgrense,
    loependeVedtakPre2025OffentligAfp,
    isOver75AndNoLoependeVedtak,
    show1963Text,
    hasAFP,
  } = useTidligstMuligUttakConditions()

  const { title, content } = React.useMemo(() => {
    return generateAfpContent(intl)({
      afpUtregning: afpUtregningValg,
      erApoteker: erApoteker ?? false,
      loependeVedtak: loependeVedtak,
      afpValg: afp,
      foedselsdato: foedselsdato!,
      samtykkeOffentligAFP: samtykkeOffentligAFP,
      beregningsvalg: beregningsvalg,
      loependeLivsvarigAfpOffentlig: loependeLivsvarigAfpOffentlig,
    })
  }, [
    intl,
    afp,
    afpUtregningValg,
    erApoteker,
    loependeVedtak,
    ufoeregrad,
    beregningsvalg,
    foedselsdato,
  ])

  const aarligInntektFoerUttakBeloepFraSkatt = useAppSelector(
    selectAarligInntektFoerUttakBeloepFraSkatt
  )

  const handlePDF = () => {
    const appContentElement = document.getElementById('app-content')
    if (appContentElement) {
      appContentElement.classList.add('hideAppContent')
    }

    const printContentElement = document.getElementById('print-content')
    if (printContentElement) {
      printContentElement.classList.add('showPrintContent')
    }
    const pdfHeadingWithLogo = getPdfHeadingWithLogo(isEnkel)

    const personalInfo = `<div 
      class="pdf-metadata"
    >
      ${person?.navn}
      <span 
        style="padding: 0 8px; font-size: 16px; font-weight: 800;"
      >\u2022</span>
      Dato opprettet: ${getCurrentDateTimeFormatted()}
    </div>`

    const forbeholdAvsnitt = getForbeholdAvsnitt(intl)

    const uttakstidspunkt = uttaksalder && formatUttaksalder(intl, uttaksalder)
    const helUttaksAlder = `<h2>Beregning av 100 % alderspensjon ved ${uttakstidspunkt} </h2>`
    const chartTableWithHeading = getChartTable({ tableData, intl })

    const tidligstMuligUttakIngress = isEnkel
      ? getTidligstMuligUttakIngressContent({
          intl,
          normertPensjonsalder,
          nedreAldersgrense,
          loependeVedtakPre2025OffentligAfp,
          isOver75AndNoLoependeVedtak,
          show1963Text,
          ufoeregrad,
          hasAFP,
          tidligstMuligUttak,
        })
      : ''

    const omstillingsstoenadAlert =
      omstillingsstoenadOgGjenlevende?.harLoependeSak
        ? getOmstillingsstoenadAlert(intl, normertPensjonsalder)
        : ''
    const shouldHideAfpHeading = Boolean(
      afpDetaljerListe.length > 0 &&
      loependeLivsvarigAfpOffentlig?.afpStatus &&
      loependeLivsvarigAfpOffentlig?.maanedligBeloep
    )
    const grunnlagIngress = getGrunnlagIngress({
      intl,
      alderspensjonDetaljerListe: alderspensjonDetaljerListe,
      aarligInntektFoerUttakBeloepFraSkatt,
      afpDetaljerListe,
      title,
      content,
      hasPre2025OffentligAfpUttaksalder: Boolean(pre2025OffentligAfp),
      uttaksalder,
      gradertUttaksperiode,
      shouldHideAfpHeading,
    })

    const finalPdfContent =
      pdfHeadingWithLogo +
      personalInfo +
      forbeholdAvsnitt +
      tidligstMuligUttakIngress +
      omstillingsstoenadAlert +
      helUttaksAlder +
      chartTableWithHeading +
      grunnlagIngress

    // Set the print content in the hidden div
    const printContentDiv = document.getElementById('print-content')
    if (printContentDiv) {
      printContentDiv.innerHTML = finalPdfContent
    }

    const documentTitle = document.title
    document.title = '' // Ikke vis document title i print preview/PDF

    window.onafterprint = () => {
      if (printContentDiv) {
        // Reset to original content after printing
        printContentDiv.innerHTML = ''
        document.title = documentTitle
      }
    }

    if (isSafari()) {
      setTimeout(() => window.print(), 100)
    } else {
      window.print()
    }
  }

  const handlePDFRef = useRef(handlePDF)

  useEffect(() => {
    handlePDFRef.current = handlePDF
  })

  // Set up the context ref connection
  useEffect(() => {
    if (showPDFRef) {
      showPDFRef.current = {
        handlePDF: () => handlePDFRef.current(),
      }
      setIsPdfReady?.(true)
    }
    return () => {
      setIsPdfReady?.(false)
    }
  }, [showPDFRef, setIsPdfReady])

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
          data: offentligTpData,
        }}
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
            pensjonsavtaler={pensjonsavtalerData?.avtaler}
            simulertTjenestepensjon={offentligTpData?.simulertTjenestepensjon}
          />
        )}
    </section>
  )
}
