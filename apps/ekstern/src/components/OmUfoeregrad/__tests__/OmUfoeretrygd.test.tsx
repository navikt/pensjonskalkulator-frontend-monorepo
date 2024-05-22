import * as ReactRouterUtils from 'react-router'

import { describe, it } from 'vitest'

import { OmUfoeretrygd } from '..'
import { paths } from '@/router/constants'
import * as userInputReducerUtils from '@/state/userInput/userInputReducer'
import { render, screen, userEvent } from '@/test-utils'

describe('OmUfoeretrygd', () => {
  it('viser riktig innhold med 100 % ufoeretrygd', async () => {
    const user = userEvent.setup()
    render(<OmUfoeretrygd ufoeregrad={100} />)

    expect(
      await screen.findByText(
        'alderspensjon fra 67 år. Kommende lovendringer vil gradvis øke pensjonsalderen for dem som er født i 1964 eller senere.',
        {
          exact: false,
        }
      )
    ).toBeVisible()

    await user.click(screen.getByText('omufoeretrygd.readmore.title'))
    expect(
      screen.getByText(
        'uføretrygd kan ikke kombineres med alderspensjon. Det er derfor ikke mulig å beregne alderspensjon før 67 år i kalkulatoren. Ved 67 år går',
        { exact: false }
      )
    ).toBeInTheDocument()
  })

  it('viser riktig innhold med gradert ufoeretrygd', async () => {
    const flushCurrentSimulationMock = vi.spyOn(
      userInputReducerUtils.userInputActions,
      'flushCurrentSimulation'
    )
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )

    const user = userEvent.setup()
    render(<OmUfoeretrygd ufoeregrad={75} />)

    expect(
      await screen.findByText(
        'alderspensjon fra 67 år. Vil du beregne uttak før 67 år, må du gå til ',
        {
          exact: false,
        }
      )
    ).toBeVisible()

    await user.click(screen.getByText('omufoeretrygd.readmore.title'))
    expect(
      screen.getByText(
        'Det er mulig å kombinere gradert uføretrygd og gradert alderspensjon fra 62 år, så lenge du har høy nok opptjening til å ta ut alderspensjon.',
        { exact: false }
      )
    ).toBeInTheDocument()
    await user.click(screen.getByText('omufoeretrygd.avansert_link'))
    expect(flushCurrentSimulationMock).toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith(paths.beregningAvansert)
  })
})
