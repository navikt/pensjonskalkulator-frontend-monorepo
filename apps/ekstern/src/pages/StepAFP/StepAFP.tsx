import {
  isAlder67MaanedenFylt,
  isFoedtFoer1963,
  isOvergangskull,
} from '@pensjonskalkulator-frontend-monorepo/utils/alder'
import React from 'react'
import { useIntl } from 'react-intl'
import { useLoaderData } from 'react-router'

import {
  AFP,
  AFPOvergangskullUtenAP,
  AFPPrivat,
} from '@/components/stegvisning/AFP'
import { useStegvisningNavigation } from '@/components/stegvisning/stegvisning-hooks'
import { paths } from '@/router/constants'
import { stepAFPAccessGuard } from '@/router/loaders'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectAfpUtregningValg,
  selectIsVeileder,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { isLoependeVedtakEndring } from '@/utils/loependeVedtak'

export function StepAFP() {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const { person, loependeVedtak, erApoteker } =
    useLoaderData<typeof stepAFPAccessGuard>()
  const previousAfp = useAppSelector(selectAfp)
  const previousAfpUtregningValg = useAppSelector(selectAfpUtregningValg)
  const isVeileder = useAppSelector(selectIsVeileder)

  const [{ onStegvisningNext, onStegvisningPrevious, onStegvisningCancel }] =
    useStegvisningNavigation(paths.afp)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.afp',
    })
  }, [])

  const onNext = (afp: AfpRadio, afpUtregningValg?: AfpUtregningValg) => {
    dispatch(userInputActions.setAfp(afp))
    if (afpUtregningValg || afpUtregningValg === null) {
      dispatch(userInputActions.setAfpUtregningValg(afpUtregningValg))
    }

    if (onStegvisningNext) {
      onStegvisningNext()
    }
  }

  if (
    isFoedtFoer1963(person.foedselsdato) &&
    (isAlder67MaanedenFylt(person.foedselsdato) ||
      isLoependeVedtakEndring(loependeVedtak))
  ) {
    return (
      <AFPPrivat
        previousAfp={previousAfp}
        onCancel={isVeileder ? undefined : onStegvisningCancel}
        onPrevious={onStegvisningPrevious}
        onNext={onNext}
      />
    )
  }

  if (
    (isOvergangskull(person.foedselsdato) || erApoteker) &&
    !isLoependeVedtakEndring(loependeVedtak)
  ) {
    return (
      <AFPOvergangskullUtenAP
        previousAfp={previousAfp}
        previousAfpUtregningValg={previousAfpUtregningValg}
        onCancel={isVeileder ? undefined : onStegvisningCancel}
        onPrevious={onStegvisningPrevious}
        onNext={onNext}
      />
    )
  }

  return (
    <AFP
      previousAfp={previousAfp}
      onCancel={isVeileder ? undefined : onStegvisningCancel}
      onPrevious={onStegvisningPrevious}
      onNext={onNext}
    />
  )
}
