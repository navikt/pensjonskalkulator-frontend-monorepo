import { useNavigate } from 'react-router-dom'

import { Start } from '@/components/stegvisning/Start'

export function Step1() {
  const navigate = useNavigate()

  const onCancel = (): void => {
    navigate('/')
  }

  const onNext = (): void => {
    navigate('/samtykke')
  }

  return <Start onCancel={onCancel} onNext={onNext} />
}
