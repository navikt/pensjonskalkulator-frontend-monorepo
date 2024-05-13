import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { BodyLong, Link } from '@navikt/ds-react'

import { ReadMore } from '@/components/common/ReadMore'
import { paths } from '@/router/constants'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './OmUfoeretrygd.module.scss'

interface Props {
  ufoeregrad: number
}

export const OmUfoeretrygd: React.FC<Props> = ({ ufoeregrad }) => {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const goToAvansert: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault()
    dispatch(userInputActions.flushCurrentSimulation())
    navigate(paths.beregningDetaljert)
  }

  return (
    <div className={styles.wrapper} data-testid="om-ufoeretrygd">
      <div className={styles.wrapperCard} aria-live="polite">
        <>
          <BodyLong size="medium" className={`${styles.ingress}`}>
            <FormattedMessage
              id={
                ufoeregrad === 100
                  ? 'omufoeretrygd.hel.ingress'
                  : 'omufoeretrygd.gradert.ingress'
              }
              values={{
                ...getFormatMessageValues(intl),
                grad: ufoeregrad,
                link: (
                  <Link href="#" onClick={goToAvansert}>
                    <FormattedMessage id="omufoeretrygd.avansert_link" />
                  </Link>
                ),
              }}
            />
          </BodyLong>
        </>

        <ReadMore
          name="Om ufoeretrygd og alderspensjon"
          className={styles.readmore}
          header={<FormattedMessage id="omufoeretrygd.readmore.title" />}
        >
          <FormattedMessage
            id={
              ufoeregrad === 100
                ? 'omufoeretrygd.readmore.hel.ingress'
                : 'omufoeretrygd.readmore.gradert.ingress'
            }
            values={{
              ...getFormatMessageValues(intl),
            }}
          />
        </ReadMore>
      </div>
    </div>
  )
}
