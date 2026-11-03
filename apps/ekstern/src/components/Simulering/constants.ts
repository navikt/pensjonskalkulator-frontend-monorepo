export const MAX_UTTAKSALDER = 77
export const COLUMN_WIDTH = 25
export const TOOLTIP_YPOS = 35

export const SERIES_COLORS = {
  SERIE_COLOR_INNTEKT: 'var(--ax-bg-neutral-strong)',
  SERIE_COLOR_AFP: 'var(--ax-bg-meta-purple-strong)',
  SERIE_COLOR_TP: 'var(--ax-bg-success-strong)',
  SERIE_COLOR_ALDERSPENSJON: 'var(--ax-bg-accent-strong-hover)',
  SERIE_COLOR_FADED_INNTEKT: 'var(--ax-bg-neutral-moderate-pressed)',
  SERIE_COLOR_FADED_AFP: 'var(--ax-bg-meta-purple-moderate-pressed)',
  SERIE_COLOR_FADED_TP: 'var(--ax-bg-success-moderate-pressed)',
  SERIE_COLOR_FADED_ALDERSPENSJON: 'var(--ax-bg-accent-moderate-pressed)',
}

export const SERIES_DEFAULT = {
  SERIE_INNTEKT: {
    type: 'column',
    pointWidth: COLUMN_WIDTH,
    name: 'beregning.highcharts.serie.inntekt.name',
    color: SERIES_COLORS.SERIE_COLOR_INNTEKT,
  },
  SERIE_TP: {
    type: 'column',
    pointWidth: COLUMN_WIDTH,
    name: 'beregning.highcharts.serie.tp.name',
    color: SERIES_COLORS.SERIE_COLOR_TP,
  },
  SERIE_AFP: {
    type: 'column',
    pointWidth: COLUMN_WIDTH,
    name: 'beregning.highcharts.serie.afp.name',
    color: SERIES_COLORS.SERIE_COLOR_AFP,
  },
  SERIE_ALDERSPENSJON: {
    type: 'column',
    pointWidth: COLUMN_WIDTH,
    name: 'beregning.highcharts.serie.alderspensjon.name',
    color: SERIES_COLORS.SERIE_COLOR_ALDERSPENSJON,
  },
}

export const highchartsScrollingSelector = '.highcharts-scrolling'
