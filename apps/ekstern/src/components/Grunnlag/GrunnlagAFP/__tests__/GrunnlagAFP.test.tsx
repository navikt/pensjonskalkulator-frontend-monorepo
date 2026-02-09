import { Accordion } from '@navikt/ds-react'

import { loependeVedtak0UfoeregradMock } from '@/mocks/mockedRTKQueryApiCalls'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen } from '@/test-utils'

import { GrunnlagAFP } from '..'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

const WrappedGrunnlagAFP = () => (
  <Accordion>
    <GrunnlagAFP />
  </Accordion>
)

describe('Grunnlag - AFP', () => {
  it('rendrer med tittel og innhold', async () => {
    render(<WrappedGrunnlagAFP />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          afp: 'ja_offentlig',
          samtykkeOffentligAFP: true,
        },
      },
      preloadedApiState: { getLoependeVedtak: loependeVedtak0UfoeregradMock },
    })
    expect(screen.getByTestId('grunnlag.afp.title')).toBeVisible()
    expect(screen.getByTestId('grunnlag.afp.content')).toBeVisible()
  })
})
