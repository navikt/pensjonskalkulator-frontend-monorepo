import { BarChart, ChartData } from '../BarChart'

const mapToChartData = (
  lønn: number,
  beregning: Pensjonsberegning[]
): ChartData[] => {
  const data = [...beregning]
    .sort((a, b) => a.alder - b.alder)
    .map(({ pensjonsbeloep, alder }) => ({
      value: pensjonsbeloep,
      label: `${alder} år`,
    }))

  data.unshift({ value: lønn, label: 'Lønn' })

  return data
}

interface Props {
  lønn: number
  beregning: Pensjonsberegning[]
}

export function UttaksalternativerChart({ lønn, beregning }: Props) {
  const data = mapToChartData(lønn, beregning)

  return <BarChart data={data} />
}
