import { useEffect, useRef, useState } from 'react'

import { InformationSquareFillIcon } from '@navikt/aksel-icons'
import { ChevronLeftCircle, ChevronRightCircle } from '@navikt/ds-icons'
import { Alert, Button, Heading, ReadMore } from '@navikt/ds-react'
import Highcharts, {
  SeriesColumnOptions,
  SeriesOptionsType,
  XAxisOptions,
} from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import { Loader } from '@/components/components/Loader'
import { TabellVisning } from '@/components/TabellVisning'
import {
  useAlderspensjonQuery,
  useGetPersonQuery,
  usePensjonsavtalerQuery,
} from '@/state/api/apiSlice'
import {
  AlderspensjonRequestBody,
  PensjonsavtalerRequestBody,
} from '@/state/api/apiSlice.types'
import {
  generateAlderspensjonRequestBody,
  generatePensjonsavtalerRequestBody,
} from '@/state/api/utils'
import { useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectAfp,
  selectSamboer,
  selectSamtykke,
} from '@/state/userInput/selectors'

import {
  COLUMN_WIDTH,
  PENSJONSGIVENDE_DATA,
  SERIE_NAME_INNTEKT,
  SERIE_NAME_AFP,
  SERIE_NAME_TP,
  SERIE_NAME_ALDERSPENSJON,
  SERIE_COLOR_INNTEKT,
  SERIE_COLOR_AFP,
  SERIE_COLOR_TP,
  SERIE_COLOR_ALDERSPENSJON,
  getChartOptions,
  generateXAxis,
  onPointUnclick,
  onVisFaerreAarClick,
  onVisFlereAarClick,
  processPensjonsberegningArray,
  processPensjonsavtalerArray,
} from './utils'

import styles from './Pensjonssimulering.module.scss'

export function Pensjonssimulering() {
  const { startAlder, startMaaned, uttaksgrad } = useAppSelector(
    selectCurrentSimulation
  )
  const harSamtykket = useAppSelector(selectSamtykke)
  const afp = useAppSelector(selectAfp)
  const harSamboer = useAppSelector(selectSamboer)
  const [alderspensjonRequestBody, setAlderspensjonRequestBody] = useState<
    AlderspensjonRequestBody | undefined
  >(undefined)
  useState<boolean>(false)
  const [showVisFlereAarButton, setShowVisFlereAarButton] =
    useState<boolean>(false)
  const [showVisFaerreAarButton, setShowVisFaerreAarButton] =
    useState<boolean>(false)
  const [pensjonsavtalerRequestBody, setPensjonsavtalerRequestBody] = useState<
    PensjonsavtalerRequestBody | undefined
  >(undefined)
  const [chartOptions, setChartOptions] = useState<Highcharts.Options>(
    getChartOptions(styles, setShowVisFlereAarButton, setShowVisFaerreAarButton)
  )
  const [isVisTabellOpen, setVisTabellOpen] = useState<boolean>(false)
  const [isPensjonsavtaleFlagVisible, setIsPensjonsavtaleFlagVisible] =
    useState<boolean>(false)
  const chartRef = useRef<HighchartsReact.RefObject>(null)
  const { data: person } = useGetPersonQuery()
  const { data: pensjonsavtaler, isSuccess: isPensjonsavtalerSuccess } =
    usePensjonsavtalerQuery(
      pensjonsavtalerRequestBody as PensjonsavtalerRequestBody,
      {
        skip: !pensjonsavtalerRequestBody || !harSamtykket || !startAlder,
      }
    )

  const {
    data: alderspensjon,
    isLoading,
    isError,
  } = useAlderspensjonQuery(
    alderspensjonRequestBody as AlderspensjonRequestBody,
    {
      skip: !alderspensjonRequestBody,
    }
  )

  useEffect(() => {
    function onPointUnclickEventHandler(e: Event) {
      onPointUnclick(e, chartRef.current?.chart)
    }
    document.addEventListener('click', onPointUnclickEventHandler)
    return () =>
      document.removeEventListener('click', onPointUnclickEventHandler)
  }, [])

  // Hent alderspensjon + AFP
  useEffect(() => {
    const requestBody = generateAlderspensjonRequestBody({
      afp,
      sivilstand: person?.sivilstand,
      harSamboer,
      foedselsdato: person?.foedselsdato,
      startAlder: startAlder,
      startMaaned: startMaaned,
      uttaksgrad: uttaksgrad,
    })
    setAlderspensjonRequestBody(requestBody)
  }, [afp, person, startAlder, startMaaned, uttaksgrad])

  // Hent pensjonsavtaler
  useEffect(() => {
    if (harSamtykket && startAlder) {
      const requestBody = generatePensjonsavtalerRequestBody({
        aar: startAlder,
        maaned: startMaaned ?? 1,
      })
      setPensjonsavtalerRequestBody(requestBody)
    }
  }, [harSamtykket, startAlder, startMaaned])

  useEffect(() => {
    if (startAlder && alderspensjon && person?.foedselsdato) {
      const aarArray = generateXAxis(
        startAlder,
        pensjonsavtaler ?? [],
        setIsPensjonsavtaleFlagVisible
      )
      setChartOptions({
        chart: {
          type: 'column',
          scrollablePlotArea: {
            minWidth: aarArray.length * COLUMN_WIDTH * 1.6,
            scrollPositionX: 0,
          },
        },
        xAxis: {
          categories: aarArray,
        },
        series: [
          {
            type: 'column',
            pointWidth: COLUMN_WIDTH,
            name: SERIE_NAME_INNTEKT,
            color: SERIE_COLOR_INNTEKT,
            data: [...PENSJONSGIVENDE_DATA].splice(0, aarArray.length),
          },
          ...(afp === 'ja_privat'
            ? [
                {
                  type: 'column',
                  pointWidth: COLUMN_WIDTH,
                  name: SERIE_NAME_AFP,
                  color: SERIE_COLOR_AFP,
                  /* c8 ignore next 1 */
                  data: processPensjonsberegningArray(alderspensjon.afpPrivat),
                } as SeriesOptionsType,
              ]
            : []),
          ...(isPensjonsavtalerSuccess
            ? [
                {
                  type: 'column',
                  pointWidth: COLUMN_WIDTH,
                  name: SERIE_NAME_TP,
                  color: SERIE_COLOR_TP,
                  /* c8 ignore next 1 */
                  data: processPensjonsavtalerArray(
                    startAlder - 1,
                    aarArray.length,
                    person.foedselsdato,
                    pensjonsavtaler
                  ),
                } as SeriesOptionsType,
              ]
            : []),
          {
            type: 'column',
            pointWidth: COLUMN_WIDTH,
            name: SERIE_NAME_ALDERSPENSJON,
            color: SERIE_COLOR_ALDERSPENSJON,
            data: processPensjonsberegningArray(alderspensjon.alderspensjon),
          },
        ],
      })
    }
  }, [startAlder, alderspensjon, pensjonsavtaler, person])

  return (
    <section className={styles.section}>
      {isLoading && (
        <Loader
          data-testid="loader"
          size="3xlarge"
          title="Et øyeblikk, vi beregner pensjonen din"
        />
      )}
      {isError && (
        <Alert variant="error">
          <Heading spacing size="small" level="2">
            TODO PEK-119 feilhåndtering Vi klarte ikke å simulere pensjonen din
          </Heading>
        </Alert>
      )}
      <HighchartsReact
        ref={chartRef}
        highcharts={Highcharts}
        options={chartOptions}
      />
      <div className={styles.buttonRow}>
        <div className={styles.buttonRowElement}>
          {/* c8 ignore next 10 - Dette dekkes av cypress scenario graffHorizontalScroll.cy */}
          {showVisFaerreAarButton && (
            <Button
              icon={<ChevronLeftCircle aria-hidden />}
              iconPosition="left"
              size="xsmall"
              variant="tertiary"
              onClick={onVisFaerreAarClick}
            >
              Færre år
            </Button>
          )}
        </div>
        <div
          className={`${styles.buttonRowElement} ${styles.buttonRowElement__Right}`}
        >
          {/* c8 ignore next 10 - Dette dekkes av cypress scenario graffHorizontalScroll.cy */}
          {showVisFlereAarButton && (
            <Button
              icon={<ChevronRightCircle aria-hidden />}
              iconPosition="right"
              size="xsmall"
              variant="tertiary"
              onClick={onVisFlereAarClick}
            >
              Flere år
            </Button>
          )}
        </div>
      </div>
      {isPensjonsavtaleFlagVisible && (
        <div className={styles.info}>
          <InformationSquareFillIcon
            className={styles.infoIcon}
            fontSize="1.5rem"
            aria-hidden
          />
          <p className={styles.infoText}>
            Du har pensjonsavtaler som starter før valgt alder. Se detaljer i
            grunnlaget under.
          </p>
        </div>
      )}
      <ReadMore
        header={
          isVisTabellOpen
            ? 'Lukk tabell av beregningen'
            : 'Vis tabell av beregningen'
        }
        className={styles.visTabell}
        open={isVisTabellOpen}
        onClick={() => {
          setVisTabellOpen(!isVisTabellOpen)
        }}
      >
        <TabellVisning
          series={chartOptions.series as SeriesColumnOptions[]}
          aarArray={(chartOptions?.xAxis as XAxisOptions).categories}
        />
      </ReadMore>
    </section>
  )
}
