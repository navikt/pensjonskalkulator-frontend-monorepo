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
      color: 'var(--a-deepblue-500)',
      update: pointUpdateMock,
    } as unknown as Point,
    {
      index: 1,
      color: 'var(--a-deepblue-500)',
      update: pointUpdateMock,
    } as unknown as Point,
    {
      index: 2,
      color: 'var(--a-deepblue-200)',
      update: pointUpdateMock,
    } as unknown as Point,
  ]
  const data2 = [
    {
      index: 0,
      color: 'var(--a-data-surface-5)',
      update: pointUpdateMock,
    } as unknown as Point,
    {
      index: 1,
      color: 'var(--a-data-surface-5)',
      update: pointUpdateMock,
    } as unknown as Point,
    {
      index: 2,
      color: 'var(--a-data-surface-5-subtle)',
      update: pointUpdateMock,
    } as unknown as Point,
  ]
  const data3 = [
    {
      index: 0,
      color: 'var(--a-purple-400)',
      update: pointUpdateMock,
    } as unknown as Point,
    {
      index: 1,
      color: 'var(--a-purple-400)',
      update: pointUpdateMock,
    } as unknown as Point,
    {
      index: 2,
      color: 'var(--a-purple-200)',
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
