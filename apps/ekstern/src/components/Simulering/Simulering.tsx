import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  ChevronLeftCircleIcon,
  ChevronRightCircleIcon,
  ExclamationmarkTriangleFillIcon,
  InformationSquareFillIcon,
} from '@navikt/aksel-icons'
import { BodyLong, Button, Heading, Link } from '@navikt/ds-react'
import clsx from 'clsx'
import Highcharts, {
  SeriesColumnOptions,
  SeriesOptionsType,
  XAxisOptions,
} from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import { AccordionContext as PensjonsavtalerAccordionContext } from '@/components/common/AccordionItem'
import { TabellVisning } from '@/components/TabellVisning'
import {
  useGetHighchartsAccessibilityPluginFeatureToggleQuery,
  usePensjonsavtalerQuery,
} from '@/state/api/apiSlice'
import { generatePensjonsavtalerRequestBody } from '@/state/api/utils'
import { useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectSamtykke,
  selectSivilstand,
  selectAfp,
} from '@/state/userInput/selectors'
import { wrapLogger } from '@/utils/logging'

import { SERIES_DEFAULT } from './constants'
import {
  getChartDefaults,
  generateXAxis,
  onVisFaerreAarClick,
  onVisFlereAarClick,
  processInntektArray,
  processPensjonsberegningArray,
  processPensjonsavtalerArray,
} from './utils'
import { getChartOptions, onPointUnclick } from './utils-highcharts'

import styles from './Simulering.module.scss'

export function Simulering(props: {
  isLoading: boolean
  aarligInntektFoerUttak: number
  alderspensjon?: AlderspensjonResponseBody
  showAfp: boolean
  showButtonsAndTable?: boolean
}) {
  const intl = useIntl()
  const {
    isLoading,
    aarligInntektFoerUttak,
    alderspensjon,
    showAfp,
    showButtonsAndTable,
  } = props
  const harSamtykket = useAppSelector(selectSamtykke)
  const afp = useAppSelector(selectAfp)
  const sivilstand = useAppSelector(selectSivilstand)
  const { data: highchartsAccessibilityFeatureToggle } =
    useGetHighchartsAccessibilityPluginFeatureToggleQuery()

  const [XAxis, setXAxis] = React.useState<string[]>([])
  const [showVisFlereAarButton, setShowVisFlereAarButton] =
    React.useState<boolean>(false)
  const [showVisFaerreAarButton, setShowVisFaerreAarButton] =
    React.useState<boolean>(false)
  const {
    ref: grunnlagPensjonsavtalerRef,
    isOpen: isPensjonsavtalerAccordionItemOpen,
    toggleOpen: togglePensjonsavtalerAccordionItem,
  } = React.useContext(PensjonsavtalerAccordionContext)
  const { startAlder, aarligInntektVsaPensjon, gradertUttaksperiode } =
    useAppSelector(selectCurrentSimulation)

  const [pensjonsavtalerRequestBody, setPensjonsavtalerRequestBody] =
    React.useState<PensjonsavtalerRequestBody | undefined>(undefined)
  const [chartOptions, setChartOptions] = React.useState<Highcharts.Options>(
    getChartOptions(
      styles,
      setShowVisFlereAarButton,
      setShowVisFaerreAarButton,
      intl
    )
  )
  const [isPensjonsavtaleFlagVisible, setIsPensjonsavtaleFlagVisible] =
    React.useState<boolean>(false)
  const chartRef = React.useRef<HighchartsReact.RefObject>(null)
  const {
    data: pensjonsavtaler,
    isFetching: isPensjonsavtalerLoading,
    isSuccess: isPensjonsavtalerSuccess,
    isError: isPensjonsavtalerError,
  } = usePensjonsavtalerQuery(
    pensjonsavtalerRequestBody as PensjonsavtalerRequestBody,
    {
      skip: !pensjonsavtalerRequestBody || !harSamtykket || !startAlder,
    }
  )

  React.useEffect(() => {
    /* c8 ignore next 3 */
    function onPointUnclickEventHandler(e: Event) {
      onPointUnclick(e, chartRef.current?.chart)
    }
    document.addEventListener('click', onPointUnclickEventHandler)
    return () =>
      document.removeEventListener('click', onPointUnclickEventHandler)
  }, [])

  // Hent pensjonsavtaler
  React.useEffect(() => {
    if (harSamtykket && startAlder) {
      const optionalGradertUttakObj = gradertUttaksperiode
        ? {
            uttaksalder: gradertUttaksperiode.uttaksalder,
            grad: gradertUttaksperiode.grad,
            aarligInntektVsaPensjon:
              gradertUttaksperiode.aarligInntektVsaPensjon,
          }
        : undefined

      const requestBody = generatePensjonsavtalerRequestBody(
        aarligInntektFoerUttak,
        afp,
        {
          uttaksalder: startAlder,
          aarligInntektVsaPensjon: aarligInntektVsaPensjon ?? 0,
        },
        sivilstand,
        optionalGradertUttakObj
      )
      setPensjonsavtalerRequestBody(requestBody)
    }
  }, [harSamtykket, startAlder])

  React.useEffect(() => {
    if (chartRef.current) {
      if (isLoading || isPensjonsavtalerLoading) {
        chartRef.current.chart.showLoading(
          `<div class="${styles.loader}"><div></div><div></div><div></div><div></div></div>`
        )
      } else {
        chartRef.current.chart.hideLoading()
      }
    }
  }, [isLoading, isPensjonsavtalerLoading])

  // Calculates the length of the x-axis, once at first and every time uttakalder or pensjonsavtaler is updated
  React.useEffect(() => {
    // recalculates temporary without pensjonsavtaler when alderspensjon is ready but not pensjonsavtaler
    if (startAlder && !isLoading && isPensjonsavtalerLoading) {
      setXAxis(
        generateXAxis(startAlder.aar, [], setIsPensjonsavtaleFlagVisible)
      )
    }
    // recalculates correclty when alderspensjon AND pensjonsavtaler are done loading
    if (startAlder && !isLoading && !isPensjonsavtalerLoading) {
      setXAxis(
        generateXAxis(
          startAlder.aar,
          pensjonsavtaler?.avtaler ?? [],
          setIsPensjonsavtaleFlagVisible
        )
      )
    }
  }, [alderspensjon, pensjonsavtaler])

  // Redraws the graph when the x-axis has changed
  React.useEffect(() => {
    if (startAlder && alderspensjon) {
      setChartOptions({
        ...getChartDefaults(XAxis),
        series: [
          {
            ...SERIES_DEFAULT.SERIE_INNTEKT,
            name: intl.formatMessage({ id: SERIES_DEFAULT.SERIE_INNTEKT.name }),
            data: processInntektArray(
              aarligInntektFoerUttak,
              XAxis.length,
              startAlder.maaneder
            ),
          } as SeriesOptionsType,
          ...(showAfp
            ? [
                {
                  ...SERIES_DEFAULT.SERIE_AFP,
                  name: intl.formatMessage({
                    id: SERIES_DEFAULT.SERIE_AFP.name,
                  }),
                  /* c8 ignore next 1 */
                  data: processPensjonsberegningArray(
                    alderspensjon.afpPrivat,
                    XAxis.length
                  ),
                } as SeriesOptionsType,
              ]
            : []),
          ...(isPensjonsavtalerSuccess && pensjonsavtaler?.avtaler.length > 0
            ? [
                {
                  ...SERIES_DEFAULT.SERIE_TP,
                  name: intl.formatMessage({
                    id: SERIES_DEFAULT.SERIE_TP.name,
                  }),
                  /* c8 ignore next 1 */
                  data: processPensjonsavtalerArray(
                    startAlder.aar - 1,
                    XAxis.length,
                    pensjonsavtaler?.avtaler
                  ),
                } as SeriesOptionsType,
              ]
            : []),
          {
            ...SERIES_DEFAULT.SERIE_ALDERSPENSJON,
            name: intl.formatMessage({
              id: SERIES_DEFAULT.SERIE_ALDERSPENSJON.name,
            }),
            data: processPensjonsberegningArray(
              alderspensjon.alderspensjon,
              XAxis.length
            ),
          } as SeriesOptionsType,
        ],
      })
    }
  }, [XAxis])

  return (
    <section className={styles.section}>
      <Heading level="3" size="medium" visuallyHidden>
        <FormattedMessage id="beregning.highcharts.title" />
      </Heading>
      <div
        data-testid="highcharts-aria-wrapper"
        aria-hidden={!highchartsAccessibilityFeatureToggle?.enabled}
      >
        <HighchartsReact
          ref={chartRef}
          highcharts={Highcharts}
          options={chartOptions}
        />
      </div>

      {showButtonsAndTable && (
        <div
          className={clsx(styles.buttonRow, {
            [styles.buttonRow__visible]:
              showVisFaerreAarButton || showVisFlereAarButton,
          })}
        >
          <div className={styles.buttonRowElement}>
            {/* c8 ignore next 10 - Dette dekkes av cypress scenario graffHorizontalScroll.cy */}
            {showVisFaerreAarButton && (
              <Button
                icon={<ChevronLeftCircleIcon aria-hidden />}
                iconPosition="left"
                size="xsmall"
                variant="tertiary"
                onClick={wrapLogger('button klikk', { tekst: 'Vis færre år' })(
                  onVisFaerreAarClick
                )}
              >
                <FormattedMessage id="beregning.button.faerre_aar" />
              </Button>
            )}
          </div>
          <div
            className={`${styles.buttonRowElement} ${styles.buttonRowElement__Right}`}
          >
            {/* c8 ignore next 10 - Dette dekkes av cypress scenario graffHorizontalScroll.cy */}
            {showVisFlereAarButton && (
              <Button
                icon={<ChevronRightCircleIcon aria-hidden />}
                iconPosition="right"
                size="xsmall"
                variant="tertiary"
                onClick={wrapLogger('button klikk', { tekst: 'Vis flere år' })(
                  onVisFlereAarClick
                )}
              >
                <FormattedMessage id="beregning.button.flere_aar" />
              </Button>
            )}
          </div>
        </div>
      )}
      {(isPensjonsavtalerError || pensjonsavtaler?.partialResponse) && (
        <div className={styles.error}>
          <ExclamationmarkTriangleFillIcon
            className={styles.errorIcon}
            fontSize="1.5rem"
            aria-hidden
          />
          <BodyLong className={styles.errorText}>
            <FormattedMessage
              id={
                isPensjonsavtalerError ||
                (pensjonsavtaler?.partialResponse &&
                  pensjonsavtaler.avtaler.length === 0)
                  ? 'beregning.pensjonsavtaler.error'
                  : 'beregning.pensjonsavtaler.error.partial'
              }
              values={{
                link: (chunks) => (
                  <Link
                    href="#"
                    onClick={(e) => {
                      e?.preventDefault()
                      if (grunnlagPensjonsavtalerRef?.current) {
                        grunnlagPensjonsavtalerRef?.current.scrollIntoView({
                          behavior: 'smooth',
                        })
                      }
                      if (!isPensjonsavtalerAccordionItemOpen)
                        togglePensjonsavtalerAccordionItem()
                    }}
                  >
                    {chunks}
                  </Link>
                ),
              }}
            />
          </BodyLong>
        </div>
      )}
      {!isPensjonsavtalerLoading && isPensjonsavtaleFlagVisible && (
        <div className={styles.info} aria-live="assertive">
          <InformationSquareFillIcon
            className={styles.infoIcon}
            fontSize="1.5rem"
            aria-hidden
          />
          <p className={styles.infoText}>
            <FormattedMessage id="beregning.pensjonsavtaler.info" />
          </p>
        </div>
      )}
      {showButtonsAndTable && (
        <TabellVisning
          series={chartOptions.series as SeriesColumnOptions[]}
          aarArray={(chartOptions?.xAxis as XAxisOptions).categories}
          showAfp={showAfp}
          showPensjonsavtaler={
            isPensjonsavtalerSuccess && pensjonsavtaler?.avtaler.length > 0
          }
        />
      )}
    </section>
  )
}
