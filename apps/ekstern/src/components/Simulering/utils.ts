import { Chart, Point, Series } from 'highcharts'

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

export const processInntektArray = (
  beloep: number,
  length: number,
  startMaaned: number | null
): number[] => {
  const dataArray = new Array(length).fill(0)
  dataArray[0] = beloep
  if (startMaaned && startMaaned !== 0) {
    const inntektPrMnd = beloep / 12
    dataArray[1] = inntektPrMnd * startMaaned
  }
  return dataArray
}

export const processPensjonsberegningArray = (
  pensjonsberegninger: Pensjonsberegning[] = []
): number[] => {
  const dataArray = [...pensjonsberegninger].map((value) => {
    return value.beloep
  })
  dataArray.unshift(0)
  return dataArray
}

// TODO PEK-163 håndtere at en avtale ikke alltid har startaar - hva gjør vi da?
// TODO PEK-163 Bør legges til en guard slik at sluttmaaned ikke får lov til å være lik eller lavere enn startMaaned når det er på samme år
//  expect(
//   getAntallMaanederMedPensjon(
//     67,
//     { aar: 67, maaneder: 3 },
//     { aar: 67, maaneder: 3 }
//   )
// ).toBe(1)
// Antall maaneder i en avtale beregnes "Fra" og "Til og med"
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
              utbetalingsperiode.grad *
              Math.max(0, antallMaanederMedPensjon)) /
            100 /
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
    if (i === startAar) {
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
  hasInntekt: boolean,
  hasPensjon: boolean
): string {
  if (hasInntekt && hasPensjon) {
    return 'Inntekt og pensjon når du er'
  } else if (hasInntekt && !hasPensjon) {
    return 'Inntekt når du er'
  } else {
    return 'Pensjon når du er'
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
  chart.series.forEach(function (serie: Series) {
    serie.data.forEach(function (point: Point) {
      const color = getNormalColor(point.color as string)
      if (point.color !== color) {
        point.update({ color: getNormalColor(point.color as string) }, false)
      }
    })
  })

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
