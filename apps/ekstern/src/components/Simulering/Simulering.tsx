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
  getAfpOffentligAlertsText,
  getOffentligTjenestePensjonAlertsText,
  getOmstillingsstoenadAlert,
  getPrivatePensjonsavtalerAlertsText,
} from '@/pdf-view/alerts'
import { getChartTable } from '@/pdf-view/chartTable'
import { getForbeholdAvsnitt } from '@/pdf-view/forbehold'
import { getGrunnlagIngress } from '@/pdf-view/grunnlag'
import { getPdfHeader } from '@/pdf-view/header'
import { getUtenlandsOppholdIngress } from '@/pdf-view/opphold'
import { getPensjonsavtaler } from '@/pdf-view/pensjonsavtaler'
import { getSivilstandIngress } from '@/pdf-view/sivilstand'
import { getTidligstMuligUttakIngress } from '@/pdf-view/tidligtMuligUttak'
import {
  useGetAfpOffentligLivsvarigQuery,
  useGetOmstillingsstoenadOgGjenlevendeQuery,
  useGetPersonQuery,
  useGetShowDownloadPdfFeatureToggleQuery,
  usePensjonsavtalerQuery,
} from '@/state/api/apiSlice'
import { isOffentligTpFoer1963 } from '@/state/api/typeguards'
import { generatePensjonsavtalerRequestBody } from '@/state/api/utils'
import { useAppSelector } from '@/state/hooks'
import {
  selectAarligInntektFoerUttakBeloepFraBrukerInput,
  selectAarligInntektFoerUttakBeloepFraSkatt,
  selectAfp,
  selectAfpUtregningValg,
  selectCurrentSimulation,
  selectEpsHarInntektOver2G,
  selectEpsHarPensjon,
  selectErApoteker,
  selectFoedselsdato,
  selectHarUtenlandsopphold,
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
import { formatSivilstand } from '@/utils/sivilstand'

import { PRINT_STYLES } from '../../pdf-view/printStyles'
import { generateAfpContent } from '../Grunnlag/GrunnlagAFP/utils'
import {
  useOppholdUtenforNorge,
  useSortedUtenlandsperioder,
} from '../Grunnlag/GrunnlagUtenlandsopphold/hooks'
import {
  useOffentligTjenestePensjonAlertList,
  usePrivatePensjonsAvtalerAlertList,
} from '../Pensjonsavtaler/hooks'
import { groupPensjonsavtalerByType } from '../Pensjonsavtaler/utils'
import { useTableData } from '../TabellVisning/hooks'
import { useBeregningsdetaljer } from './BeregningsdetaljerForOvergangskull/hooks'
import { MaanedsbeloepAvansertBeregning } from './MaanedsbeloepAvansertBeregning'
import { SimuleringAfpOffentligAlert } from './SimuleringAfpOffentligAlert/SimuleringAfpOffentligAlert'
import { SimuleringEndringBanner } from './SimuleringEndringBanner/SimuleringEndringBanner'
import { SimuleringGrafNavigation } from './SimuleringGrafNavigation/SimuleringGrafNavigation'
import { SimuleringPensjonsavtalerAlert } from './SimuleringPensjonsavtalerAlert/SimuleringPensjonsavtalerAlert'
import {
  useAfpOffentligAlerts,
  useOffentligTpData,
  useSimuleringChartLocalState,
} from './hooks'

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
  const { showPDFRef, setIsPdfReady } = useContext(BeregningContext)
  const harSamtykket = useAppSelector(selectSamtykke)
  const ufoeregrad = useAppSelector(selectUfoeregrad)
  const afp = useAppSelector(selectAfp)
  const sivilstand = useAppSelector(selectSivilstand)
  const foedselsdato = useAppSelector(selectFoedselsdato)
  const isEndring = useAppSelector(selectIsEndring)
  const epsHarPensjon = useAppSelector(selectEpsHarPensjon)
  const epsHarInntektOver2G = useAppSelector(selectEpsHarInntektOver2G)
  const utenlandsperioder = useAppSelector(selectUtenlandsperioder)
  const harUtenlandsopphold = useAppSelector(selectHarUtenlandsopphold)
  const sortedUtenlandsperioder = harUtenlandsopphold
    ? useSortedUtenlandsperioder(utenlandsperioder)
    : []
  const { uttaksalder, aarligInntektVsaHelPensjon, gradertUttaksperiode } =
    useAppSelector(selectCurrentSimulation)
  const erApoteker = useAppSelector(selectErApoteker)
  const skalBeregneAfpKap19 = useAppSelector(selectSkalBeregneAfpKap19)
  const chartRef = useRef<HighchartsReact.RefObject>(null)
  const samtykkeOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const afpUtregningValg = useAppSelector(selectAfpUtregningValg)
  const { beregningsvalg } = useAppSelector(selectCurrentSimulation)
  const oppholdUtenforNorge = useOppholdUtenforNorge({
    harForLiteTrygdetid: detaljer?.harForLiteTrygdetid,
  })

  const [pensjonsavtalerRequestBody, setPensjonsavtalerRequestBody] = useState<
    PensjonsavtalerRequestBody | undefined
  >(undefined)

  const {
    data: offentligTp,
    isLoading: isOffentligTpLoading,
    isError: isOffentligTpError,
    afpPerioder,
    erOffentligTpFoer1963,
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

  const handlePDFRef = useRef<(() => void) | null>(null)

  // Detect mobile once - user agent doesn't change during session
  const isMobile = React.useMemo(
    () =>
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        window.navigator.userAgent
      ),
    []
  )

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

  const privatPensjonsAvtalerAlertsList = usePrivatePensjonsAvtalerAlertList({
    isPartialResponse: pensjonsavtalerData?.partialResponse || false,
    isError: isPensjonsavtalerError,
    isSuccess: isPensjonsavtalerSuccess,
    headingLevel,
    privatePensjonsavtaler: pensjonsavtalerData?.avtaler,
  })

  const offentligTjenestePensjonsAvtalerAlertsList =
    useOffentligTjenestePensjonAlertList({
      isError: isOffentligTpError,
      offentligTp,
    })

  const afpOffentligAlertsList = useAfpOffentligAlerts({
    harSamtykketOffentligAFP,
    isAfpOffentligLivsvarigSuccess,
    loependeLivsvarigAfpOffentlig,
  })

  const formatertSivilstand = React.useMemo(
    () => formatSivilstand(intl, sivilstand!),
    [sivilstand]
  )

  const aarligInntektFoerUttakBeloepFraBrukerInput = useAppSelector(
    selectAarligInntektFoerUttakBeloepFraBrukerInput
  )
  const generatePdfContent = () => {
    const pdfHeader = getPdfHeader({ isEnkel, person })

    const forbeholdAvsnitt = getForbeholdAvsnitt(intl)

    const uttakstidspunkt = uttaksalder && formatUttaksalder(intl, uttaksalder)
    const helUttaksAlder = isEnkel
      ? `<h2>Beregning av 100 % alderspensjon ved ${uttakstidspunkt} </h2>`
      : ''
    const chartTableWithHeading = getChartTable({ tableData, intl })

    const tidligstMuligUttakIngress = isEnkel
      ? getTidligstMuligUttakIngress({
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
      aarligInntektFoerUttakBeloepFraBrukerInput,
      afpDetaljerListe,
      title,
      content,
      hasPre2025OffentligAfpUttaksalder: Boolean(pre2025OffentligAfp),
      uttaksalder,
      gradertUttaksperiode,
      shouldHideAfpHeading,
    })

    const gruppertePensjonsavtaler = pensjonsavtalerData?.avtaler
      ? groupPensjonsavtalerByType(pensjonsavtalerData?.avtaler)
      : undefined

    const privatePensjonsavtalerAlertsMessage =
      getPrivatePensjonsavtalerAlertsText({
        pensjonsavtalerAlertsList: privatPensjonsAvtalerAlertsList,
        intl,
      })

    const offentligTjenestePensjonAlertsMessage =
      getOffentligTjenestePensjonAlertsText({
        offentligTpAlertsList: offentligTjenestePensjonsAvtalerAlertsList,
        offentligTp,
        intl,
      })

    const afpOffentligAlertsMessage = afpOffentligAlertsList
      ? getAfpOffentligAlertsText({
          afpOffentligAlertsList,
          intl,
        })
      : ''

    const pensjonsavtaler = harSamtykket
      ? getPensjonsavtaler({
          intl,
          privatePensjonsAvtaler: gruppertePensjonsavtaler,
          offentligTp,
        })
      : `<h3>Pensjonsavtaler (arbeidsgivere m.m.)</h3>${intl.formatMessage({ id: 'pensjonsavtaler.ingress.error.samtykke_ingress' })}`

    const omDegIngress = `<h2>${intl.formatMessage({ id: 'om_deg.title' })}</h2>
        ${getSivilstandIngress({ intl, formatertSivilstand })}
        ${getUtenlandsOppholdIngress({ intl, oppholdUtenforNorge, sortedUtenlandsperioder })}`

    return (
      pdfHeader +
      forbeholdAvsnitt +
      tidligstMuligUttakIngress +
      omstillingsstoenadAlert +
      helUttaksAlder +
      chartTableWithHeading +
      grunnlagIngress +
      pensjonsavtaler +
      afpOffentligAlertsMessage +
      privatePensjonsavtalerAlertsMessage +
      offentligTjenestePensjonAlertsMessage +
      omDegIngress
    )
  }

  // Prepare mobile print content (used by both button and native browser print)
  const prepareMobilePrintContent = () => {
    const appContentElement = document.getElementById('app-content')
    const printContentElement = document.getElementById('print-content')

    // Skip if already prepared
    if (printContentElement?.classList.contains('showPrintContent')) {
      return
    }

    const finalPdfContent = generatePdfContent()

    if (appContentElement) {
      appContentElement.classList.add('hideAppContent')
    }

    if (printContentElement) {
      printContentElement.classList.add('showPrintContent')
      printContentElement.innerHTML = `<style>${PRINT_STYLES}</style>${finalPdfContent}`
    }

    const documentTitle = document.title
    document.title = ''

    const cleanup = () => {
      if (printContentElement) {
        printContentElement.innerHTML = ''
        printContentElement.classList.remove('showPrintContent')
      }
      if (appContentElement) {
        appContentElement.classList.remove('hideAppContent')
      }
      document.title = documentTitle
      window.removeEventListener('afterprint', cleanup)
    }

    window.addEventListener('afterprint', cleanup)
  }

  const prepareMobilePrintContentRef = useRef(prepareMobilePrintContent)
  prepareMobilePrintContentRef.current = prepareMobilePrintContent

  const handlePDF = () => {
    // Mobile: Use div replacement approach (works better on mobile)
    if (isMobile) {
      prepareMobilePrintContent()

      setTimeout(() => {
        window.print()
      }, 100)

      return
    }

    // Desktop: Use popup window approach (avoids mc-ref artifacts for JAWS users)
    const finalPdfContent = generatePdfContent()
    const printWindow = window.open('', 'printWindow', 'status')
    if (!printWindow) {
      console.error('Could not open print window - popup may be blocked')
      return
    }

    // Set document content using modern DOM APIs instead of deprecated document.write
    const doc = printWindow.document
    doc.documentElement.innerHTML = `
      <head>
        <meta charset="UTF-8">
  
        <title>Pensjonskalkulator beregning</title>
        <style>${PRINT_STYLES}</style>
      </head>
      <body>
        <div class="print-overlay">Laster ...</div>
        ${finalPdfContent}
      </body>
    `
    doc.documentElement.setAttribute('lang', 'nb')

    // Close window immediately when print dialog closes (print or cancel)
    printWindow.onafterprint = () => {
      printWindow.close()
    }

    // Wait for fonts to load before printing to ensure consistent font rendering
    printWindow.document.fonts.ready.then(() => {
      printWindow.focus()
      printWindow.print()
    })
  }

  useEffect(() => {
    handlePDFRef.current = handlePDF
  })

  useEffect(() => {
    const locationUrl = window.location.href
    if (!locationUrl.includes('beregning') || !showPDF?.enabled) {
      return
    }

    // Intercept Cmd+P / Ctrl+P to use our custom print
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        handlePDFRef.current?.()
        return false
      }
    }

    // On mobile, intercept native browser print via beforeprint event
    const handleBeforePrint = () => {
      prepareMobilePrintContentRef.current?.()
    }

    window.addEventListener('keydown', handleKeyDown, true)

    if (isMobile) {
      window.addEventListener('beforeprint', handleBeforePrint)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      if (isMobile) {
        window.removeEventListener('beforeprint', handleBeforePrint)
      }
    }
  }, [showPDF?.enabled, isMobile])

  // Set up the context ref connection
  useEffect(() => {
    if (showPDFRef) {
      showPDFRef.current = {
        handlePDF: () => handlePDFRef.current?.(),
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
