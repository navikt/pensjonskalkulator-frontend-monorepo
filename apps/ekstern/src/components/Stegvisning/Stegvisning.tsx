import { useParams } from 'react-router-dom'

import { Step0 } from './Step0'
import { Step1 } from './Step1'

export function Stegvisning() {
  const { stepId = '0' } = useParams()

  const getStep = (id: Step): JSX.Element => {
    switch (id) {
      case '0': {
        return <Step0 />
      }
      case '1': {
        return <Step1 />
      }

      default: {
        return <Step0 />
      }
    }
  }
  return getStep(stepId as Step)
}
