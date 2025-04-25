import { FormattedMessage } from 'react-intl'
import { useLocation } from 'react-router'

import { Button, HStack } from '@navikt/ds-react'

import { wrapLogger } from '@/utils/logging'

export default function Navigation({
  onPrevious,
  onCancel,
  form,
  className,
}: {
  onPrevious: () => void
  onCancel: (() => void) | undefined
  form?: string
  className?: string
}) {
  const { pathname } = useLocation()

  return (
    <HStack gap="4" marginBlock="4 0" className={className}>
      <Button type="submit" form={form}>
        <FormattedMessage id="stegvisning.neste" />
      </Button>

      <Button
        type="button"
        variant="secondary"
        onClick={wrapLogger('button klikk', {
          tekst: `Tilbake fra ${pathname}`,
        })(onPrevious)}
      >
        <FormattedMessage id="stegvisning.tilbake" />
      </Button>

      {onCancel && (
        <Button
          type="button"
          variant="tertiary"
          onClick={wrapLogger('button klikk', { tekst: 'Avbryt' })(onCancel)}
        >
          <FormattedMessage id="stegvisning.avbryt" />
        </Button>
      )}
    </HStack>
  )
}
