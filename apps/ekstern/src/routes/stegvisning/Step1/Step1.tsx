import { useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Start } from '@/components/stegvisning/Start'
import { paths } from '@/routes'
import { apiSlice } from '@/state/api/apiSlice'
import { useGetPersonQuery } from '@/state/api/apiSlice'
import { useAppDispatch } from '@/state/hooks'

export function Step1() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: person, isError, isSuccess } = useGetPersonQuery()

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
    if (isError) {
      dispatch(apiSlice.util.invalidateTags(['Person']))
    }
  }

  return (
    <Start
      fornavn={isSuccess ? (person as Person).fornavn : ''}
      onCancel={onCancel}
      onNext={onNext}
    />
  )
}
