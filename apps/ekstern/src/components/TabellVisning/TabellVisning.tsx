import { Table } from '@navikt/ds-react'

interface Props {
  data: Array<{
    alder: string
    sum: string
    detaljer: string
  }>
}

export function TabellVisning({ data }: Props) {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell />
          <Table.HeaderCell scope="col">Alder</Table.HeaderCell>
          <Table.HeaderCell scope="col">Sum (kr)</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map(({ alder, sum }, i) => {
          return (
            <Table.ExpandableRow key={i} content={<p>{'Grid coming'}</p>}>
              <Table.DataCell scope="row">{alder}</Table.DataCell>
              <Table.DataCell>{sum}</Table.DataCell>
            </Table.ExpandableRow>
          )
        })}
      </Table.Body>
    </Table>
  )
}
