import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useAppSelector } from '@/state/hooks'
import { selectSamtykke } from '@/state/userInput/selectors'

import { Step0 } from './Step0'
import { Step1 } from './Step1'
import { Step2 } from './Step2'

export function Stegvisning() {
  const { stepId = '0' } = useParams()
  const navigate = useNavigate()
  const harSamtykket = useAppSelector(selectSamtykke)

  useEffect(() => {
    // TODO legge til logikk for redirect ved TPO også
    if (stepId === '2' && !harSamtykket) {
      return navigate('/stegvisning/3')
    }
  }, [stepId])

  const renderStep = (id: Step): JSX.Element => {
    switch (id) {
      case '0': {
        return <Step0 />
      }
      case '1': {
        return <Step1 />
      }
      case '2': {
        return <Step2 />
      }
      default: {
        return <Step0 />
      }
    }
  }
  return renderStep(stepId as Step)
}
