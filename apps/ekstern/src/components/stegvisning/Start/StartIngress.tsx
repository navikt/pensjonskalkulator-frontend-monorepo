import { clsx } from 'clsx'
import { FormattedMessage } from 'react-intl'

import { BodyLong } from '@navikt/ds-react'

import styles from './Start.module.scss'

export const StartIngress: React.FC = () => (
  <>
    <BodyLong size="large">
      <FormattedMessage id="stegvisning.start.ingress" />
    </BodyLong>

    <ul className={styles.list}>
      <li>
        <BodyLong size="large">
          <span className={clsx(styles.ellipse, styles.ellipse__blue)} />
          <FormattedMessage id="stegvisning.start.list_item1" />
        </BodyLong>
      </li>
      <li>
        <BodyLong size="large">
          <span className={clsx(styles.ellipse, styles.ellipse__purple)} />
          <FormattedMessage id="stegvisning.start.list_item2" />{' '}
        </BodyLong>
      </li>
      <li>
        <BodyLong size="large">
          <span className={clsx(styles.ellipse, styles.ellipse__green)} />
          <FormattedMessage id="stegvisning.start.list_item3" />{' '}
        </BodyLong>
      </li>
    </ul>

    <BodyLong size="medium">
      <FormattedMessage id="stegvisning.start.ingress_2" />
    </BodyLong>
  </>
)
