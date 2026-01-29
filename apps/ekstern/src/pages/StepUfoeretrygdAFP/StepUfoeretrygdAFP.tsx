import React from 'react'
import { useIntl } from 'react-intl'

import { Ufoere } from '@/components/stegvisning/Ufoere'
import { useStegvisningNavigation } from '@/components/stegvisning/stegvisning-hooks'
import { paths } from '@/router/constants'
import { useAppSelector } from '@/state/hooks'
import { selectIsVeileder } from '@/state/userInput/selectors'

export function StepUfoeretrygdAFP() {
  const intl = useIntl()

  const [{ onStegvisningNext, onStegvisningPrevious, onStegvisningCancel }] =
    useStegvisningNavigation(paths.ufoeretrygdAFP)

  const isVeileder = useAppSelector(selectIsVeileder)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.ufoeretryg_AFP',
    })
  }, [])

  return (
    <Ufoere
      onCancel={isVeileder ? undefined : onStegvisningCancel}
      onPrevious={onStegvisningPrevious}
      onNext={onStegvisningNext}
    />
  )
}
