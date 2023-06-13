import { useNavigate } from 'react-router-dom'

import { Start } from '@/components/stegvisning/Start'
import { useGetPersonQuery } from '@/state/api/apiSlice'

export function Step1() {
  const navigate = useNavigate()
  const { data: person } = useGetPersonQuery()

  const onCancel = (): void => {
    navigate('/')
  }

  const onNext = (): void => {
    navigate('/samtykke')
  }
  // TODO hva gjør vi dersom person feiler, eller fornavn ikke kommer?
  return person?.fornavn ? (
    <Start fornavn={person?.fornavn} onCancel={onCancel} onNext={onNext} />
  ) : (
    <></>
  )
}
