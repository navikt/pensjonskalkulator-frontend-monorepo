import React from 'react'
import { useIntl } from 'react-intl'
import { useLoaderData } from 'react-router'

import {
  StartForBrukereFyllt75,
  StartForBrukereUnder75,
} from '@/components/stegvisning/Start'
import { useStegvisningNavigation } from '@/components/stegvisning/stegvisning-hooks'
import { paths } from '@/router/constants'
import { stepStartAccessGuard } from '@/router/loaders'
import { useAppSelector } from '@/state/hooks'
import { selectIsVeileder } from '@/state/userInput/selectors'
import { isAlderOver75Plus1Maaned } from '@/utils/alder'

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

  if (isAlderOver75Plus1Maaned(person.foedselsdato)) {
    return <StartForBrukereFyllt75 />
  }

  return (
    <StartForBrukereUnder75
      navn={person.navn}
      onCancel={isVeileder ? undefined : onStegvisningCancel}
      onNext={onStegvisningNext}
      loependeVedtak={loependeVedtak}
    />
  )
}
