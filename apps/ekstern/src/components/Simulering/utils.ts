import { IntlShape } from 'react-intl'

import { Chart, Point, Series } from 'highcharts'

import { getAlderMinus1Maaned } from '@/utils/alder'

import {
  COLUMN_WIDTH,
  MAX_UTTAKSALDER,
  SERIES_COLORS,
  highchartsScrollingSelector,
} from './constants'
import {
  ExtendedAxis,
  HighchartsScrollingHTMLDivElement,
} from './utils-highcharts'

export const getChartDefaults = (aarArray: string[]) => {
  return {
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
  }
}

export const processInntektArray = (args: {
  startAar: number
  inntektFoerUttakBeloep: number
  gradertUttak:
    | {
        fra: Alder
        til: Alder
        beloep?: number
      }
    | undefined
  heltUttak:
    | {
        fra: Alder
        til?: Alder
        beloep?: number
      }
    | undefined

  length: number
}): number[] => {
  const { startAar, inntektFoerUttakBeloep, gradertUttak, heltUttak, length } =
    args

  const utbetalingsperioder = [
    // før uttak
    {
      startAlder: { aar: startAar, maaneder: 0 },
      sluttAlder: gradertUttak
        ? getAlderMinus1Maaned(gradertUttak.fra)
        : heltUttak
          ? getAlderMinus1Maaned(heltUttak.fra)
          : undefined,
      aarligUtbetaling: inntektFoerUttakBeloep,
    },
    // gradert
    ...(gradertUttak
      ? [
          {
            startAlder: gradertUttak.fra,
            sluttAlder: gradertUttak.til,
            aarligUtbetaling: gradertUttak.beloep ?? 0,
          },
        ]
      : []),
    // helt
    ...(heltUttak
      ? [
          {
            startAlder: heltUttak.fra,
            sluttAlder: heltUttak.til,
            aarligUtbetaling: heltUttak.beloep ?? 0,
          },
        ]
      : []),
  ]

  const sluttAlder = startAar + length - 1
  const result = new Array(sluttAlder - startAar + 1).fill(0)

  utbetalingsperioder.forEach((utbetalingsperiode) => {
    const periodeStartYear = Math.max(
      startAar,
      utbetalingsperiode.startAlder.aar
    )
    const avtaleEndYear = utbetalingsperiode.sluttAlder
      ? Math.min(sluttAlder, utbetalingsperiode.sluttAlder.aar)
      : sluttAlder

    for (let year = periodeStartYear; year <= avtaleEndYear; year++) {
      if (year >= startAar) {
        const antallMaanederMedPensjon = getAntallMaanederMedPensjon(
          year,
          utbetalingsperiode.startAlder,
          utbetalingsperiode.sluttAlder
        )

        const allocatedAmount =
          (utbetalingsperiode.aarligUtbetaling *
            Math.max(0, antallMaanederMedPensjon)) /
          12
        result[year - startAar] += allocatedAmount
      }
    }
  })

  return result
}

export const processPensjonsberegningArray = (
  pensjonsberegninger: Pensjonsberegning[] = [],
  length: number
): number[] => {
  const arrayLength = Math.max(length, pensjonsberegninger.length + 2)
  const dataArray = new Array(1).fill(0)

  const livsvarigPensjonsbeloep =
    pensjonsberegninger[pensjonsberegninger.length - 1]?.beloep ?? 0

  for (let index = 1; index < arrayLength; index++) {
    dataArray.push(
      pensjonsberegninger[index - 1]?.beloep || livsvarigPensjonsbeloep
    )
  }
  return dataArray
}

// Antall maaneder i en avtale beregnes "Fra og med" og "Til og med"
export const getAntallMaanederMedPensjon = (
  year: number,
  utbetalingsperiodeStartAlder: Alder,
  utbetalingsperiodeSluttAlder?: Alder
) => {
  // Hvis vi viser første år av avtalen, tar vi høyde for startMaaned, hvis ikke teller avtalen fra måned 0 (fult år)
  const periodStartMonth =
    utbetalingsperiodeStartAlder.aar === year
      ? utbetalingsperiodeStartAlder.maaneder
      : 0

  // Hvis avtalen har en sluttdato og at vi viser siste av avtalen, tar vi høyde for sluttMaaned, hvis ikke teller avtalen til måned 11 (fult år)
  const periodEndMonth =
    utbetalingsperiodeSluttAlder && year === utbetalingsperiodeSluttAlder?.aar
      ? utbetalingsperiodeSluttAlder.maaneder
      : 11

  return periodEndMonth - periodStartMonth + 1
}

export const processPensjonsavtalerArray = (
  startAar: number, // uttaksaar, minus 1
  length: number,
  pensjonsavtaler: Pensjonsavtale[]
): number[] => {
  const sluttAlder = startAar + length - 1
  const result = new Array(sluttAlder - startAar + 1).fill(0)

  pensjonsavtaler.forEach((avtale) => {
    avtale.utbetalingsperioder.forEach((utbetalingsperiode) => {
      const avtaleStartYear = Math.max(
        startAar,
        utbetalingsperiode.startAlder.aar
      )
      const avtaleEndYear = utbetalingsperiode.sluttAlder
        ? Math.min(sluttAlder, utbetalingsperiode.sluttAlder.aar)
        : sluttAlder

      for (let year = avtaleStartYear; year <= avtaleEndYear; year++) {
        if (year >= startAar) {
          const antallMaanederMedPensjon = getAntallMaanederMedPensjon(
            year,
            utbetalingsperiode.startAlder,
            utbetalingsperiode.sluttAlder
          )

          const allocatedAmount =
            (utbetalingsperiode.aarligUtbetaling *
              Math.max(0, antallMaanederMedPensjon)) /
            12
          result[year - startAar] += allocatedAmount
        }
      }
    })
  })
  return result
}

export const generateXAxis = (
  startAar: number,
  isEndring: boolean,
  pensjonsavtaler: Pensjonsavtale[],
  setIsPensjonsavtaleFlagVisible: React.Dispatch<React.SetStateAction<boolean>>
) => {
  let sluttAar = MAX_UTTAKSALDER
  let hasAvtaleBeforeStartAlder = false

  pensjonsavtaler.forEach((avtale) => {
    if (avtale.sluttAar && avtale.sluttAar > sluttAar) {
      sluttAar = avtale.sluttAar
    }
    if (
      !hasAvtaleBeforeStartAlder &&
      avtale.startAar &&
      avtale.startAar < startAar
    ) {
      hasAvtaleBeforeStartAlder = true
    }
  })
  const alderArray: string[] = []
  for (let i = startAar; i <= sluttAar + 1; i++) {
    if (!isEndring && i === startAar) {
      alderArray.push((i - 1).toString())
    }

    if (i === sluttAar + 1) {
      alderArray.push(`${i - 1}+`.toString())
    } else {
      alderArray.push(i.toString())
    }
  }
  setIsPensjonsavtaleFlagVisible(hasAvtaleBeforeStartAlder)
  return alderArray
}

export function getTooltipTitle(
  antallAar: string,
  hasInntekt: boolean,
  hasPensjon: boolean,
  intl: IntlShape
): string {
  if (hasInntekt && hasPensjon) {
    return `${intl.formatMessage({
      id: 'beregning.highcharts.tooltip.inntekt_og_pensjon',
    })} ${antallAar} ${intl.formatMessage({
      id: 'alder.aar',
    })}`
  } else if (hasInntekt && !hasPensjon) {
    return `${intl.formatMessage({
      id: 'beregning.highcharts.tooltip.inntekt',
    })} ${antallAar} ${intl.formatMessage({
      id: 'alder.aar',
    })}`
  } else {
    return `${intl.formatMessage({
      id: 'beregning.highcharts.tooltip.pensjon',
    })} ${antallAar} ${intl.formatMessage({
      id: 'alder.aar',
    })}`
  }
}

export const onVisFaerreAarClick = () => {
  const el = document.querySelector(highchartsScrollingSelector)
  if (el) {
    ;(el as HTMLElement).scrollLeft -= 50
  }
}

export const onVisFlereAarClick = () => {
  const el = document.querySelector(highchartsScrollingSelector)
  if (el) {
    ;(el as HTMLElement).scrollLeft += 50
  }
}

export const getHoverColor = (previousColor: string): string => {
  switch (previousColor) {
    case SERIES_COLORS.SERIE_COLOR_INNTEKT: {
      return SERIES_COLORS.SERIE_COLOR_FADED_INNTEKT
    }
    case SERIES_COLORS.SERIE_COLOR_AFP: {
      return SERIES_COLORS.SERIE_COLOR_FADED_AFP
    }
    case SERIES_COLORS.SERIE_COLOR_TP: {
      return SERIES_COLORS.SERIE_COLOR_FADED_TP
    }
    case SERIES_COLORS.SERIE_COLOR_ALDERSPENSJON: {
      return SERIES_COLORS.SERIE_COLOR_FADED_ALDERSPENSJON
    }
    default: {
      return ''
    }
  }
}

export const getNormalColor = (previousColor: string): string => {
  switch (previousColor) {
    case SERIES_COLORS.SERIE_COLOR_FADED_INNTEKT: {
      return SERIES_COLORS.SERIE_COLOR_INNTEKT
    }
    case SERIES_COLORS.SERIE_COLOR_FADED_AFP: {
      return SERIES_COLORS.SERIE_COLOR_AFP
    }
    case SERIES_COLORS.SERIE_COLOR_FADED_TP: {
      return SERIES_COLORS.SERIE_COLOR_TP
    }
    case SERIES_COLORS.SERIE_COLOR_FADED_ALDERSPENSJON: {
      return SERIES_COLORS.SERIE_COLOR_ALDERSPENSJON
    }
    default: {
      return previousColor
    }
  }
}

export function resetColumnColors(chart: Chart): void {
  if (chart.series) {
    chart.series.forEach(function (serie: Series) {
      serie.data.forEach(function (point: Point) {
        const color = getNormalColor(point.color as string)
        if (point.color !== color) {
          point.update({ color: getNormalColor(point.color as string) }, false)
        }
      })
    })
  }

  if ((chart.xAxis[0] as ExtendedAxis).labelGroup) {
    ;(chart.xAxis[0] as ExtendedAxis).labelGroup.element.childNodes.forEach(
      function (label: HTMLElement) {
        label.style.fontWeight = 'normal'
      }
    )
  }
  chart?.tooltip.update({
    enabled: false,
  })
  chart.redraw()
}

export function handleChartScroll(
  event: Event,
  args: {
    chart?: Chart
    scrollPosition?: number
  }
) {
  if (event.currentTarget) {
    const { chart, scrollPosition } = args
    const el = event.currentTarget as HighchartsScrollingHTMLDivElement
    const elementScrollPosition = el.scrollLeft
    if (chart && scrollPosition !== el.scrollLeft) {
      resetColumnColors(chart)
    }

    const isRightButtonAvailable = el.scrollWidth > el.offsetWidth

    if (elementScrollPosition === 0) {
      el.handleButtonVisibility.showRightButton(isRightButtonAvailable)
      el.handleButtonVisibility.showLeftButton(false)
    } else if (elementScrollPosition + el.offsetWidth === el.scrollWidth) {
      el.handleButtonVisibility.showRightButton(false)
      el.handleButtonVisibility.showLeftButton(true)
    } else {
      el.handleButtonVisibility.showRightButton(isRightButtonAvailable)
      el.handleButtonVisibility.showLeftButton(true)
    }
  }
}
