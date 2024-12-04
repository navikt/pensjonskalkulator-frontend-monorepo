import React from 'react'

import { HeadingProps } from '@navikt/ds-react'

import { useIsMobile } from '@/utils/useIsMobile'

import { PrivatePensjonsavtalerMobile, PrivatePensjonsavtalerDesktop } from './'
interface PrivatePensjonsavtalerProps {
  headingLevel: HeadingProps['level']
  privatePensjonsavtaler: Pensjonsavtale[]
}

export const PrivatePensjonsavtaler: React.FC<PrivatePensjonsavtalerProps> = ({
  headingLevel,
  privatePensjonsavtaler,
}) => {
  const isMobile = useIsMobile()

  return (
    <div data-testid="pensjonsavtaler-list">
      {isMobile ? (
        <PrivatePensjonsavtalerMobile
          headingLevel={headingLevel}
          pensjonsavtaler={privatePensjonsavtaler}
        />
      ) : (
        <PrivatePensjonsavtalerDesktop
          headingLevel={headingLevel}
          pensjonsavtaler={privatePensjonsavtaler}
        />
      )}
    </div>
  )
}
