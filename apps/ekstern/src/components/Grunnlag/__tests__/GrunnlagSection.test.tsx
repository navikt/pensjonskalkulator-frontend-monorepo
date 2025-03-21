import { Accordion } from '@navikt/ds-react'

import { GrunnlagSection } from '@/components/Grunnlag/GrunnlagSection'
import { render, screen } from '@/test-utils'

describe('GrunnlagSection', () => {
  it('Når isLoading er true, viser loader, headerTitle og innhold, men ikke headerValue', async () => {
    render(
      <Accordion>
        <Accordion.Item>
          <GrunnlagSection headerTitle="mytest" headerValue="details" isLoading>
            Lorem
          </GrunnlagSection>
        </Accordion.Item>
      </Accordion>
    )
    expect(screen.getByTestId('mytest-loader')).toBeInTheDocument()
    expect(screen.getByText('mytest')).toBeInTheDocument()
    expect(screen.getByText('Lorem')).toBeInTheDocument()
    expect(screen.queryByText('details')).not.toBeInTheDocument()
  })
  it('Når isLoading er false, viser headerTitle, headerValue og innhold', async () => {
    render(
      <Accordion>
        <Accordion.Item>
          <GrunnlagSection headerTitle="mytest" headerValue="details">
            Lorem
          </GrunnlagSection>
        </Accordion.Item>
      </Accordion>
    )
    expect(screen.queryByTestId('mytest-loader')).not.toBeInTheDocument()
    expect(screen.getByText('mytest')).toBeInTheDocument()
    expect(screen.getByText('Lorem')).toBeInTheDocument()
    expect(screen.getByText('details')).toBeInTheDocument()
  })
})
