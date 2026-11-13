import { FormattedMessage } from 'react-intl'
import { useLocation } from 'react-router'

import { Button, HStack } from '@navikt/ds-react'

import { wrapLogger } from '@/utils/logging'

export default function Navigation({
  onPrevious,
  onCancel,
  form,
  className,
  isNextDisabled,
  isPreviousDisabled,
}: {
  onPrevious: () => void
  onCancel: (() => void) | undefined
  form?: string
  className?: string
  isNextDisabled?: boolean
  isPreviousDisabled?: boolean
}) {
  const { pathname } = useLocation()

  return (
    <HStack gap="space-16" marginBlock="space-16 space-0" className={className}>
      <Button
        type="submit"
        form={form}
        disabled={isNextDisabled}
        data-testid="stegvisning-neste-button"
      >
        <FormattedMessage id="stegvisning.neste" />
      </Button>

      <Button
        type="button"
        variant="secondary"
        disabled={isPreviousDisabled}
        data-testid="stegvisning-tilbake-button"
        onClick={wrapLogger('knapp klikket', {
          tekst: `Tilbake fra ${pathname}`,
        })(onPrevious)}
      >
        <FormattedMessage id="stegvisning.tilbake" />
      </Button>

      {onCancel && (
        <Button
          type="button"
          variant="tertiary"
          data-testid="stegvisning-avbryt-button"
          onClick={wrapLogger('knapp klikket', { tekst: 'Avbryt' })(onCancel)}
        >
          <FormattedMessage id="stegvisning.avbryt" />
        </Button>
      )}
    </HStack>
  )
}
