import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { BodyLong, Heading, Link, VStack } from '@navikt/ds-react'

import { BeregningContext } from '@/pages/Beregning/context'
import { paths } from '@/router/constants'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectAfpUtregningValg,
  selectCurrentSimulation,
  selectErApoteker,
  selectFoedselsdato,
  selectLoependeVedtak,
  selectSamtykkeOffentligAFP,
  selectUfoeregrad,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { logger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import { generateAfpContent } from './utils'

import styles from '../Grunnlag.module.scss'

export const GrunnlagAFP: React.FC = () => {
  const intl = useIntl()
  const afp = useAppSelector(selectAfp)
  const afpUtregningValg = useAppSelector(selectAfpUtregningValg)
  const erApoteker = useAppSelector(selectErApoteker)
  const foedselsdato = useAppSelector(selectFoedselsdato)
  const samtykkeOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const loependeVedtak = useAppSelector(selectLoependeVedtak)
  const ufoeregrad = useAppSelector(selectUfoeregrad)
  const { beregningsvalg } = useAppSelector(selectCurrentSimulation)

  const { title, content } = React.useMemo(() => {
    return generateAfpContent(intl)({
      afpUtregning: afpUtregningValg,
      erApoteker: erApoteker ?? false,
      loependeVedtak: loependeVedtak,
      afpValg: afp,
      foedselsdato: foedselsdato!,
      samtykkeOffentligAFP: samtykkeOffentligAFP,
      beregningsvalg: beregningsvalg,
    })
  }, [
    intl,
    afp,
    afpUtregningValg,
    erApoteker,
    loependeVedtak,
    ufoeregrad,
    beregningsvalg,
    foedselsdato,
  ])

  return (
    <VStack gap="1">
      <Heading level="3" size="small" data-testid="grunnlag.afp.title">
        <FormattedMessage id="grunnlag.afp.title" />:{' '}
        <span style={{ fontWeight: 'normal' }}>{title}</span>
      </Heading>
      <BodyLong
        data-testid="grunnlag.afp.content"
        className={styles.alderspensjonDetaljer}
      >
        <FormattedMessage
          id={content}
          values={{
            ...getFormatMessageValues(),
            goToAFP: GoToAFP,
            goToAvansert: GoToAvansert,
            goToStart: GoToStart,
          }}
        />
      </BodyLong>
    </VStack>
  )
}

const GoToAFP = (chunks: React.ReactNode) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const onClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault()
    logger('button klikk', {
      tekst: 'Grunnlag AFP: Gå til AFP',
    })
    dispatch(userInputActions.flushCurrentSimulation())
    navigate(paths.afp)
  }
  return (
    <Link href="#" onClick={onClick} data-testid="grunnlag.afp.afp_link">
      {chunks}
    </Link>
  )
}
const GoToAvansert = (chunks: React.ReactNode) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { avansertSkjemaModus, setAvansertSkjemaModus } =
    React.useContext(BeregningContext)

  const onClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault()
    logger('button klikk', {
      tekst: 'Grunnlag AFP: Gå til avansert',
    })
    if (avansertSkjemaModus === 'resultat') {
      setAvansertSkjemaModus('redigering')
    } else {
      dispatch(userInputActions.flushCurrentSimulation())
      navigate(paths.beregningAvansert)
    }
  }
  return (
    <Link href="#" onClick={onClick} data-testid="grunnlag.afp.avansert_link">
      {chunks}
    </Link>
  )
}
const GoToStart = (chunks: React.ReactNode) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const onClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault()
    logger('button klikk', {
      tekst: 'Grunnlag AFP: Gå til start',
    })
    dispatch(userInputActions.flush())
    navigate(paths.start)
  }
  return (
    <Link href="#" onClick={onClick} data-testid="grunnlag.afp.reset_link">
      {chunks}
    </Link>
  )
}
