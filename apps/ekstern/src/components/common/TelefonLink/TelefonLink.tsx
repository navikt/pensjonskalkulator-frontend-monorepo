import { FormattedMessage, useIntl } from 'react-intl'
import { Link } from 'react-router'

export const TelefonLink = () => {
  const intl = useIntl()
  return (
    <Link
      to={`tel:${intl.formatMessage({ id: 'link.telefon_pensjon' })}`}
      target="_blank"
    >
      <FormattedMessage id="link.telefon_pensjon" />
    </Link>
  )
}
