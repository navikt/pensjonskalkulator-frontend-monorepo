import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useAppSelector } from '@/state/hooks'
import { selectSamtykke } from '@/state/userInput/selectors'

import { Step1 } from './Step1'
import { Step2 } from './Step2'
import { Step3 } from './Step3'

export function Stegvisning() {
  const { stepId = '0' } = useParams()
  const navigate = useNavigate()
  const harSamtykket = useAppSelector(selectSamtykke)

  useEffect(() => {
    // TODO legge til logikk for redirect ved TPO også
    if (stepId === '3' && !harSamtykket) {
      return navigate('/stegvisning/4')
    }
  }, [stepId])

  const renderStep = (id: Step): JSX.Element => {
    switch (id) {
      case '1': {
        return <Step1 />
      }
      case '2': {
        return <Step2 />
      }
      case '3': {
        return <Step3 />
      }
      default: {
        return <Step1 />
      }
    }
  }
  return renderStep(stepId as Step)
}
