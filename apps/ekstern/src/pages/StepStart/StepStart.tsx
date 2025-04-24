import React from 'react'
import { useIntl } from 'react-intl'
import { useLoaderData } from 'react-router'

import { Start } from '@/components/stegvisning/Start'
import { useStegvisningNavigation } from '@/components/stegvisning/stegvisning-hooks'
import { paths } from '@/router/constants'
import { stepStartAccessGuard } from '@/router/loaders'
import { useAppSelector } from '@/state/hooks'
import { selectIsVeileder } from '@/state/userInput/selectors'

export function StepStart() {
  const intl = useIntl()

  const { person, loependeVedtak } =
    useLoaderData<typeof stepStartAccessGuard>()

  const [{ onStegvisningNext, onStegvisningCancel }] = useStegvisningNavigation(
    paths.start
  )

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.start',
    })
  }, [])

  const isVeileder = useAppSelector(selectIsVeileder)

  return (
    <Start
      navn={person.navn}
      onCancel={isVeileder ? undefined : onStegvisningCancel}
      onNext={onStegvisningNext}
      loependeVedtak={loependeVedtak}
    />
  )
}
