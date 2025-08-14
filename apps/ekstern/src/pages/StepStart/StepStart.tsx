import React from 'react'
import { useIntl } from 'react-intl'
import { useLoaderData, useNavigate } from 'react-router'

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
  const navigate = useNavigate()

  const loaderData = useLoaderData<typeof stepStartAccessGuard>()

  // * Handle case where loader data might be undefined (e.g., during reload)
  if (!loaderData) {
    return null
  }

  const { person, loependeVedtak } = loaderData

  const [{ onStegvisningNext, onStegvisningCancel }] = useStegvisningNavigation(
    paths.start
  )

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.start',
    })
  }, [])

  const isVeileder = useAppSelector(selectIsVeileder)

  const onNext = () => {
    // * Hvis du har løpende vedtak om gammel offentlig AFP, men tidligere har hatt vedtak om alderspensjon så skal man bli redirigert til avansert beregning.
    if (
      loependeVedtak?.pre2025OffentligAfp &&
      loependeVedtak?.alderspensjon?.grad === 0
    ) {
      navigate(paths.beregningAvansert)
    } else if (onStegvisningNext) {
      onStegvisningNext()
    }
  }

  if (!person || !loependeVedtak) {
    return null
  }

  if (isAlderOver75Plus1Maaned(person.foedselsdato)) {
    return <StartForBrukereFyllt75 />
  }

  return (
    <StartForBrukereUnder75
      navn={person.navn}
      onCancel={isVeileder ? undefined : onStegvisningCancel}
      onNext={onNext}
      loependeVedtak={loependeVedtak}
    />
  )
}
