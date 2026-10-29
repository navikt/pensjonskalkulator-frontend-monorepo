import { Point } from 'highcharts'
import { Mock } from 'vitest'

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getChartMock = (
  pointUpdateMock: Mock<any>,
  tooltipUpdateMock: Mock<any>,
  tooltipRefreshMock: Mock<any>
) => {
  const data1 = [
    {
      index: 0,
      color: 'var(--ax-bg-accent-strong-hover)',
      update: pointUpdateMock,
    } as unknown as Point,
    {
      index: 1,
      color: 'var(--ax-bg-accent-strong-hover)',
      update: pointUpdateMock,
    } as unknown as Point,
    {
      index: 2,
      color: 'var(--ax-bg-accent-moderate-pressed)',
      update: pointUpdateMock,
    } as unknown as Point,
  ]
  const data2 = [
    {
      index: 0,
      color: 'var(--ax-bg-success-strong)',
      update: pointUpdateMock,
    } as unknown as Point,
    {
      index: 1,
      color: 'var(--ax-bg-success-strong)',
      update: pointUpdateMock,
    } as unknown as Point,
    {
      index: 2,
      color: 'var(--ax-bg-success-moderate-pressed)',
      update: pointUpdateMock,
    } as unknown as Point,
  ]
  const data3 = [
    {
      index: 0,
      color: 'var(--ax-bg-meta-purple-strong)',
      update: pointUpdateMock,
    } as unknown as Point,
    {
      index: 1,
      color: 'var(--ax-bg-meta-purple-strong)',
      update: pointUpdateMock,
    } as unknown as Point,
    {
      index: 2,
      color: 'var(--ax-bg-meta-purple-moderate-pressed)',
      update: pointUpdateMock,
    } as unknown as Point,
  ]

  const chart = {
    tooltip: {
      isHidden: false,
      update: tooltipUpdateMock,
      refresh: tooltipRefreshMock,
    },
    series: [
      {
        data: [...data1],
      },
      {
        data: [...data2],
      },
      {
        data: [...data3],
      },
    ],
    xAxis: [
      {
        labelGroup: {
          element: {
            childNodes: [
              document.createElement('text'),
              document.createElement('text'),
              document.createElement('text'),
            ],
          },
        },
      },
    ],
  }
  return chart
}
