import { SeriesColumnOptions, XAxisOptions } from 'highcharts'
import React, { useCallback, useContext, useEffect } from 'react'
import { IntlShape, useIntl } from 'react-intl'

import { HeadingProps } from '@navikt/ds-react'

import { generateAfpContent } from '@/components/Grunnlag/GrunnlagAFP/utils'
import {
  useOppholdUtenforNorge,
  useSortedUtenlandsperioder,
} from '@/components/Grunnlag/GrunnlagUtenlandsopphold/hooks'
import {
  useOffentligTjenestePensjonAlertList,
  usePrivatePensjonsAvtalerAlertList,
} from '@/components/Pensjonsavtaler/hooks'
import { groupPensjonsavtalerByType } from '@/components/Pensjonsavtaler/utils'
import { useBeregningsdetaljer } from '@/components/Simulering/BeregningsdetaljerForOvergangskull/hooks'
import {
  useAfpOffentligAlerts,
  useOffentligTpData,
} from '@/components/Simulering/hooks'
import { useTableData } from '@/components/TabellVisning/hooks'
import { BeregningContext } from '@/pages/Beregning/context'
import {
  useGetAfpOffentligLivsvarigQuery,
  useGetOmstillingsstoenadOgGjenlevendeQuery,
  useGetPersonQuery,
  useGetShowDownloadPdfFeatureToggleQuery,
} from '@/state/api/apiSlice'
import { useAppSelector } from '@/state/hooks'
import {
  selectAarligInntektFoerUttakBeloepFraBrukerInput,
  selectAarligInntektFoerUttakBeloepFraSkatt,
  selectAfp,
  selectAfpUtregningValg,
  selectCurrentSimulation,
  selectErApoteker,
  selectFoedselsdato,
  selectHarUtenlandsopphold,
  selectIsEndring,
  selectLoependeVedtak,
  selectSamtykke,
  selectSamtykkeOffentligAFP,
  selectSivilstand,
  selectUfoeregrad,
  selectUtenlandsperioder,
} from '@/state/userInput/selectors'
import { formatUttaksalder, isAlderOver62 } from '@/utils/alder'
import {
  useTidligstMuligUttak,
  useTidligstMuligUttakConditions,
} from '@/utils/hooks/useTidligstMuligUttakData'
import { formatSivilstand } from '@/utils/sivilstand'

import {
  getAfpOffentligAlertsText,
  getOffentligTjenestePensjonAlertsText,
  getOmstillingsstoenadAlert,
  getPrivatePensjonsavtalerAlertsText,
} from './alerts'
import { getChartTable } from './chartTable'
import { getForbeholdAvsnitt } from './forbehold'
import { getGrunnlagIngress } from './grunnlag'
import { getPdfHeader } from './header'
import { getUtenlandsOppholdIngress } from './opphold'
import { getPensjonsavtaler } from './pensjonsavtaler'
import { PRINT_STYLES } from './printStyles'
import { getSivilstandIngress } from './sivilstand'
import { getTidligstMuligUttakIngress } from './tidligtMuligUttak'
import { getUttaksGradEndringIngress } from './uttaksGradEndringIngress'

// ============================================================================
// Types
// ============================================================================

interface UsePdfViewProps {
  chartOptions: Highcharts.Options
  headingLevel: HeadingProps['level']
  alderspensjonListe?: AlderspensjonPensjonsberegning[]
  afpPrivatListe?: AfpPrivatPensjonsberegning[]
  pre2025OffentligAfp?: AfpEtterfulgtAvAlderspensjon
  afpOffentligListe?: AfpPensjonsberegning[]
  detaljer?: {
    trygdetid?: number
    opptjeningsgrunnlag?: SimulertOpptjeningGrunnlag[]
    harForLiteTrygdetid?: boolean
  }
  visning?: BeregningVisning
  pensjonsavtalerData?: {
    avtaler: Pensjonsavtale[]
    partialResponse: boolean
  }
  isPensjonsavtalerSuccess: boolean
  isPensjonsavtalerError: boolean
  isLoading?: boolean
}

// ============================================================================
// Helper Functions (Pure - no hooks)
// ============================================================================

const isMobileDevice = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  )

const openDesktopPrintWindow = (content: string) => {
  const printWindow = window.open('', 'printWindow', 'width=1000,height=600')
  if (!printWindow) {
    console.error('Could not open print window - popup may be blocked')
    return
  }

  const doc = printWindow.document
  doc.documentElement.innerHTML = `
    <head>
      <meta charset="UTF-8">
      <title>Pensjonskalkulator beregning</title>
      <link rel="preload" href="https://cdn.nav.no/aksel/fonts/SourceSans3-normal.woff2" as="font" type="font/woff2" crossorigin>
      <style>${PRINT_STYLES}</style>
    </head>
    <body>
      <div class="print-overlay">Laster ...</div>
      ${content}
    </body>
  `
  doc.documentElement.setAttribute('lang', 'nb')

  printWindow.onafterprint = () => printWindow.close()

  printWindow.document.fonts.ready.then(() => {
    printWindow.focus()
    printWindow.print()
  })
}

const prepareMobilePrint = (content: string) => {
  const appContentElement = document.getElementById('app-content')
  const printContentElement = document.getElementById('print-content')

  if (printContentElement?.classList.contains('showPrintContent')) {
    return
  }

  appContentElement?.classList.add('hideAppContent')

  if (printContentElement) {
    printContentElement.classList.add('showPrintContent')
    printContentElement.innerHTML = `<style>${PRINT_STYLES}</style>${content}`
  }

  const documentTitle = document.title
  document.title = ''

  const cleanup = () => {
    if (printContentElement) {
      printContentElement.innerHTML = ''
      printContentElement.classList.remove('showPrintContent')
    }
    appContentElement?.classList.remove('hideAppContent')
    document.title = documentTitle
    window.removeEventListener('afterprint', cleanup)
  }

  window.addEventListener('afterprint', cleanup)
}

// ============================================================================
// Custom Hooks for Data Fetching
// ============================================================================

const useReduxSelectors = () => {
  const harSamtykket = useAppSelector(selectSamtykke)
  const harSamtykketOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const afpUtregningValg = useAppSelector(selectAfpUtregningValg)
  const erApoteker = useAppSelector(selectErApoteker)
  const loependeVedtak = useAppSelector(selectLoependeVedtak)
  const ufoeregrad = useAppSelector(selectUfoeregrad)
  const afp = useAppSelector(selectAfp)
  const sivilstand = useAppSelector(selectSivilstand)
  const foedselsdato = useAppSelector(selectFoedselsdato)
  const utenlandsperioder = useAppSelector(selectUtenlandsperioder)
  const harUtenlandsopphold = useAppSelector(selectHarUtenlandsopphold)
  const aarligInntektFoerUttakBeloepFraSkatt = useAppSelector(
    selectAarligInntektFoerUttakBeloepFraSkatt
  )
  const aarligInntektFoerUttakBeloepFraBrukerInput = useAppSelector(
    selectAarligInntektFoerUttakBeloepFraBrukerInput
  )
  const { beregningsvalg, uttaksalder, gradertUttaksperiode } = useAppSelector(
    selectCurrentSimulation
  )
  const isEndring = useAppSelector(selectIsEndring)

  return {
    harSamtykket,
    harSamtykketOffentligAFP,
    afpUtregningValg,
    erApoteker,
    loependeVedtak,
    ufoeregrad,
    afp,
    sivilstand,
    foedselsdato,
    utenlandsperioder,
    harUtenlandsopphold,
    aarligInntektFoerUttakBeloepFraSkatt,
    aarligInntektFoerUttakBeloepFraBrukerInput,
    beregningsvalg,
    uttaksalder,
    gradertUttaksperiode,
    isEndring,
  }
}

const useApiData = (
  harSamtykketOffentligAFP: boolean | null,
  foedselsdato: string | undefined
) => {
  const { data: person } = useGetPersonQuery()
  const { data: showPDF } = useGetShowDownloadPdfFeatureToggleQuery()
  const { data: omstillingsstoenadOgGjenlevende } =
    useGetOmstillingsstoenadOgGjenlevendeQuery()
  const { data: offentligTp, isError: isOffentligTpError } =
    useOffentligTpData()

  const {
    isSuccess: isAfpOffentligLivsvarigSuccess,
    data: loependeLivsvarigAfpOffentlig,
  } = useGetAfpOffentligLivsvarigQuery(undefined, {
    skip:
      !harSamtykketOffentligAFP ||
      !foedselsdato ||
      !isAlderOver62(foedselsdato),
  })

  return {
    person,
    showPDF,
    omstillingsstoenadOgGjenlevende,
    offentligTp,
    isOffentligTpError,
    isAfpOffentligLivsvarigSuccess,
    loependeLivsvarigAfpOffentlig,
  }
}

// ============================================================================
// PDF Content Generation
// ============================================================================

const generatePdfContent = (params: {
  intl: IntlShape
  isEnkel: boolean
  uttaksGradEndring: number | undefined
  person: Person | undefined
  tableData: ReturnType<typeof useTableData>
  uttaksalder: Alder | null
  harSamtykket: boolean | null
  normertPensjonsalder: Alder
  nedreAldersgrense: Alder
  loependeVedtakPre2025OffentligAfp: boolean
  isOver75AndNoLoependeVedtak: boolean
  show1963Text: boolean
  ufoeregrad: number | null
  hasAFP: boolean
  tidligstMuligUttak: Alder | undefined
  harOmstillingsstoenadLoependeSak: boolean
  alderspensjonDetaljerListe: ReturnType<
    typeof useBeregningsdetaljer
  >['alderspensjonDetaljerListe']
  afpDetaljerListe: ReturnType<typeof useBeregningsdetaljer>['afpDetaljerListe']
  aarligInntektFoerUttakBeloepFraSkatt:
    | { beloep: string; aar: number }
    | undefined
  aarligInntektFoerUttakBeloepFraBrukerInput: string | null
  afpTitle: string | undefined
  afpContent: string | undefined
  hasPre2025OffentligAfp: boolean
  gradertUttaksperiode: GradertUttak | null
  loependeLivsvarigAfpOffentlig: AfpOffentligLivsvarig | undefined
  pensjonsavtalerData?: { avtaler: Pensjonsavtale[]; partialResponse: boolean }
  offentligTp: OffentligTpResponse | undefined
  privatPensjonsAvtalerAlertsList: ReturnType<
    typeof usePrivatePensjonsAvtalerAlertList
  >
  offentligTjenestePensjonsAvtalerAlertsList: ReturnType<
    typeof useOffentligTjenestePensjonAlertList
  >
  afpOffentligAlertsList: ReturnType<typeof useAfpOffentligAlerts>
  formatertSivilstand: string
  oppholdUtenforNorge: ReturnType<typeof useOppholdUtenforNorge>
  sortedUtenlandsperioder: Utenlandsperiode[]
}): string => {
  const {
    intl,
    isEnkel,
    uttaksGradEndring: uttaksGradForBrukerMedAP,
    person,
    tableData,
    uttaksalder,
    harSamtykket,
    normertPensjonsalder,
    nedreAldersgrense,
    loependeVedtakPre2025OffentligAfp,
    isOver75AndNoLoependeVedtak,
    show1963Text,
    ufoeregrad,
    hasAFP,
    tidligstMuligUttak,
    harOmstillingsstoenadLoependeSak,
    alderspensjonDetaljerListe,
    afpDetaljerListe,
    aarligInntektFoerUttakBeloepFraSkatt,
    aarligInntektFoerUttakBeloepFraBrukerInput,
    afpTitle,
    afpContent,
    hasPre2025OffentligAfp,
    gradertUttaksperiode,
    loependeLivsvarigAfpOffentlig,
    pensjonsavtalerData,
    offentligTp,
    privatPensjonsAvtalerAlertsList,
    offentligTjenestePensjonsAvtalerAlertsList,
    afpOffentligAlertsList,
    formatertSivilstand,
    oppholdUtenforNorge,
    sortedUtenlandsperioder,
  } = params

  // Header & Forbehold
  const pdfHeader = getPdfHeader({ isEnkel, person })
  const forbeholdAvsnitt = getForbeholdAvsnitt(intl)

  const uttaksGradEndringIngress = uttaksGradForBrukerMedAP
    ? getUttaksGradEndringIngress({ prosent: uttaksGradForBrukerMedAP, intl })
    : ''

  // Tidligst mulig uttak (only for enkel view)
  const tidligstMuligUttakIngress = isEnkel
    ? getTidligstMuligUttakIngress({
        intl,
        normertPensjonsalder,
        nedreAldersgrense,
        loependeVedtakPre2025OffentligAfp,
        isOver75AndNoLoependeVedtak,
        show1963Text,
        ufoeregrad: ufoeregrad ?? 0,
        hasAFP,
        tidligstMuligUttak,
      })
    : ''

  // Omstillingsstoenad alert
  const omstillingsstoenadAlert = harOmstillingsstoenadLoependeSak
    ? getOmstillingsstoenadAlert(intl, normertPensjonsalder)
    : ''

  // Uttaksalder heading (only for enkel view)
  const uttakstidspunkt = uttaksalder && formatUttaksalder(intl, uttaksalder)
  const helUttaksAlder = isEnkel
    ? `<h2>Beregning av 100 % alderspensjon ved ${uttakstidspunkt} </h2>`
    : ''

  // Chart table
  const chartTableWithHeading = getChartTable({ tableData, intl, isEnkel })

  // Grunnlag
  const shouldHideAfpHeading = Boolean(
    afpDetaljerListe.length > 0 &&
    loependeLivsvarigAfpOffentlig?.afpStatus &&
    loependeLivsvarigAfpOffentlig?.maanedligBeloep
  )

  const afpOffentligAlertsMessage = afpOffentligAlertsList
    ? getAfpOffentligAlertsText({ afpOffentligAlertsList, intl })
    : ''

  const grunnlagIngress = getGrunnlagIngress({
    intl,
    alderspensjonDetaljerListe,
    aarligInntektFoerUttakBeloepFraSkatt,
    aarligInntektFoerUttakBeloepFraBrukerInput,
    afpDetaljerListe,
    title: afpTitle,
    content: afpContent,
    afpOffentligAlertsMessage,
    hasPre2025OffentligAfpUttaksalder: hasPre2025OffentligAfp,
    uttaksalder,
    gradertUttaksperiode,
    shouldHideAfpHeading,
    isEnkel,
  })

  // Pensjonsavtaler
  const gruppertePensjonsavtaler = pensjonsavtalerData?.avtaler
    ? groupPensjonsavtalerByType(pensjonsavtalerData.avtaler)
    : undefined

  const pensjonsavtaler = harSamtykket
    ? getPensjonsavtaler({
        intl,
        privatePensjonsAvtaler: gruppertePensjonsavtaler,
        offentligTp,
      })
    : `<h3>Pensjonsavtaler (arbeidsgivere m.m.)</h3>${intl.formatMessage({ id: 'pensjonsavtaler.ingress.error.samtykke_ingress' })}`

  // Alerts

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

  const omDegIngress = `<h2>${intl.formatMessage({ id: 'om_deg.title' })}</h2>
    ${getSivilstandIngress({ intl, formatertSivilstand })}
    ${getUtenlandsOppholdIngress({ intl, oppholdUtenforNorge, sortedUtenlandsperioder })}`

  return [
    pdfHeader,
    forbeholdAvsnitt,
    uttaksGradEndringIngress,
    tidligstMuligUttakIngress,
    omstillingsstoenadAlert,
    helUttaksAlder,
    chartTableWithHeading,
    grunnlagIngress,
    pensjonsavtaler,
    privatePensjonsavtalerAlertsMessage,
    offentligTjenestePensjonAlertsMessage,
    omDegIngress,
  ].join('')
}

export const usePdfView = ({
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
  isLoading = false,
}: UsePdfViewProps) => {
  const intl = useIntl()
  const { showPDFRef, setIsPdfReady } = useContext(BeregningContext)
  const isEnkel = visning === 'enkel'

  // #region Redux State
  const {
    harSamtykket,
    harSamtykketOffentligAFP,
    afpUtregningValg,
    erApoteker,
    loependeVedtak,
    ufoeregrad,
    afp,
    sivilstand,
    foedselsdato,
    utenlandsperioder,
    harUtenlandsopphold,
    aarligInntektFoerUttakBeloepFraSkatt,
    aarligInntektFoerUttakBeloepFraBrukerInput,
    beregningsvalg,
    uttaksalder,
    gradertUttaksperiode,
    isEndring,
  } = useReduxSelectors()
  // #endregion Redux State

  // #region API Data
  const {
    person,
    showPDF,
    omstillingsstoenadOgGjenlevende,
    offentligTp,
    isOffentligTpError,
    isAfpOffentligLivsvarigSuccess,
    loependeLivsvarigAfpOffentlig,
  } = useApiData(harSamtykketOffentligAFP, foedselsdato)
  // #endregion API Data

  // #region Derived Data (Chart, Utenlandsopphold, TidligstMuligUttak, Beregningsdetaljer)
  const series = chartOptions.series as SeriesColumnOptions[]
  const aarArray = (chartOptions?.xAxis as XAxisOptions).categories
  const tableData = useTableData(series, aarArray)

  const oppholdUtenforNorge = useOppholdUtenforNorge({
    harForLiteTrygdetid: detaljer?.harForLiteTrygdetid,
  })

  const sortedUtenlandsperioder = harUtenlandsopphold
    ? useSortedUtenlandsperioder(utenlandsperioder)
    : []

  const { data: tidligstMuligUttak } = useTidligstMuligUttak(ufoeregrad)

  const {
    normertPensjonsalder,
    nedreAldersgrense,
    loependeVedtakPre2025OffentligAfp,
    isOver75AndNoLoependeVedtak,
    show1963Text,
    hasAFP,
  } = useTidligstMuligUttakConditions()

  const { alderspensjonDetaljerListe, afpDetaljerListe } =
    useBeregningsdetaljer(
      alderspensjonListe,
      afpPrivatListe,
      afpOffentligListe,
      pre2025OffentligAfp,
      loependeLivsvarigAfpOffentlig
    )
  // #endregion Derived Data

  // #region Memoized Values (isMobile, afpContent, formatertSivilstand)
  const isMobile = React.useMemo(() => isMobileDevice(), [])

  const formatertSivilstand = React.useMemo(
    () => formatSivilstand(intl, sivilstand!),
    [intl, sivilstand]
  )

  const { title: afpTitle, content: afpContent } = React.useMemo(
    () =>
      generateAfpContent(intl)({
        afpUtregning: afpUtregningValg,
        erApoteker: erApoteker ?? false,
        loependeVedtak,
        afpValg: afp,
        foedselsdato: foedselsdato!,
        samtykkeOffentligAFP: harSamtykketOffentligAFP,
        beregningsvalg,
        loependeLivsvarigAfpOffentlig,
      }),
    [
      intl,
      afp,
      afpUtregningValg,
      erApoteker,
      loependeVedtak,
      beregningsvalg,
      foedselsdato,
      harSamtykketOffentligAFP,
      loependeLivsvarigAfpOffentlig,
    ]
  )
  // #endregion Memoized Values

  // #region Alerts for Pensjonsavtaler
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
  // #endregion Alerts

  const uttaksGradForBrukerMedAP = isEndring
    ? loependeVedtak?.alderspensjon?.grad
    : undefined

  // #region PDF Generation
  const createPdfContent = useCallback(
    () =>
      generatePdfContent({
        intl,
        isEnkel,
        uttaksGradEndring: uttaksGradForBrukerMedAP,
        person,
        tableData,
        uttaksalder,
        harSamtykket,
        normertPensjonsalder,
        nedreAldersgrense,
        loependeVedtakPre2025OffentligAfp,
        isOver75AndNoLoependeVedtak,
        show1963Text,
        ufoeregrad,
        hasAFP,
        tidligstMuligUttak,
        harOmstillingsstoenadLoependeSak:
          omstillingsstoenadOgGjenlevende?.harLoependeSak ?? false,
        alderspensjonDetaljerListe,
        afpDetaljerListe,
        aarligInntektFoerUttakBeloepFraSkatt,
        aarligInntektFoerUttakBeloepFraBrukerInput,
        afpTitle,
        afpContent,
        hasPre2025OffentligAfp: Boolean(pre2025OffentligAfp),
        gradertUttaksperiode,
        loependeLivsvarigAfpOffentlig,
        pensjonsavtalerData,
        offentligTp,
        privatPensjonsAvtalerAlertsList,
        offentligTjenestePensjonsAvtalerAlertsList,
        afpOffentligAlertsList,
        formatertSivilstand,
        oppholdUtenforNorge,
        sortedUtenlandsperioder,
      }),
    [
      intl,
      isEnkel,
      isEndring,
      person,
      tableData,
      uttaksalder,
      harSamtykket,
      normertPensjonsalder,
      nedreAldersgrense,
      loependeVedtakPre2025OffentligAfp,
      isOver75AndNoLoependeVedtak,
      show1963Text,
      ufoeregrad,
      hasAFP,
      tidligstMuligUttak,
      omstillingsstoenadOgGjenlevende,
      alderspensjonDetaljerListe,
      afpDetaljerListe,
      aarligInntektFoerUttakBeloepFraSkatt,
      aarligInntektFoerUttakBeloepFraBrukerInput,
      afpTitle,
      afpContent,
      pre2025OffentligAfp,
      gradertUttaksperiode,
      loependeLivsvarigAfpOffentlig,
      pensjonsavtalerData,
      offentligTp,
      privatPensjonsAvtalerAlertsList,
      offentligTjenestePensjonsAvtalerAlertsList,
      afpOffentligAlertsList,
      formatertSivilstand,
      oppholdUtenforNorge,
      sortedUtenlandsperioder,
    ]
  )
  // #endregion PDF Generation

  // #region Print Handler
  const handlePDF = useCallback(() => {
    const content = createPdfContent()
    if (isMobile) {
      prepareMobilePrint(content)
      setTimeout(() => window.print(), 100)
    } else {
      openDesktopPrintWindow(content)
    }
  }, [isMobile, createPdfContent])
  // #endregion Print Handler

  // #region Context Connection & Keyboard Shortcut
  useEffect(() => {
    // Connect to context
    if (showPDFRef) {
      showPDFRef.current = { handlePDF }
      // Only show PDF button when data is loaded
      setIsPdfReady?.(!isLoading)
    }

    // Skip keyboard handling if PDF is disabled or still loading
    if (
      !showPDF?.enabled ||
      !window.location.href.includes('beregning') ||
      isLoading
    ) {
      return () => setIsPdfReady?.(false)
    }

    // Keyboard shortcut (Cmd+P / Ctrl+P)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        handlePDF()
      }
    }

    // Mobile beforeprint handler
    const handleBeforePrint = () => {
      prepareMobilePrint(createPdfContent())
    }

    window.addEventListener('keydown', handleKeyDown, true)
    if (isMobile) {
      window.addEventListener('beforeprint', handleBeforePrint)
    }

    return () => {
      setIsPdfReady?.(false)
      window.removeEventListener('keydown', handleKeyDown, true)
      if (isMobile) {
        window.removeEventListener('beforeprint', handleBeforePrint)
      }
    }
  }, [
    showPDFRef,
    setIsPdfReady,
    showPDF?.enabled,
    isMobile,
    handlePDF,
    createPdfContent,
    isLoading,
  ])
  // #endregion Context Connection & Keyboard Shortcut
}
