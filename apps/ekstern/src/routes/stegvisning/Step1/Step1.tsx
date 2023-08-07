import { useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Start } from '@/components/stegvisning/Start'
import { paths } from '@/routes'
import { useGetPersonQuery } from '@/state/api/apiSlice'

export function Step1() {
  const intl = useIntl()
  const navigate = useNavigate()
  const { data: person, isError } = useGetPersonQuery()

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step1',
    })
  }, [])

  const onCancel = (): void => {
    navigate(paths.root)
  }

  const onNext = (): void => {
    navigate(paths.samtykke)
  }

  return isError || person?.fornavn ? (
    <Start
      fornavn={!isError ? person?.fornavn : ''}
      onCancel={onCancel}
      onNext={onNext}
    />
  ) : (
    <></>
  )
}
